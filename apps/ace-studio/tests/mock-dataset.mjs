/**
 * @module mock-dataset
 * @remarks Disposable deterministic simulation of audited dataset endpoints.
 * This fixture never writes to disk or accesses user media.
 * @internal
 */
const sample = (index, labeled = false) => ({
  index, filename: "mock-" + index + ".wav", audio_path: "/mock/audio/" + index + ".wav",
  duration: 60, caption: "Analog atmosphere", genre: "ambient",
  prompt_override: null, lyrics: "[Instrumental]", bpm: null,
  keyscale: "", timesignature: "4/4", language: "unknown",
  is_instrumental: true, labeled
});

async function jsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

/**
 * @internal Create isolated in-memory dataset handlers for browser scenarios.
 * @returns An async responder function returning true for handled routes.
 */
export function createDatasetSimulator() {
  let dataset = null;
  let label = null, preprocess = null;
  let sequence = 0;

  const overview = () => ({
    dataset_name: dataset.name, num_samples: dataset.samples.length,
    labeled_count: dataset.samples.filter(s => s.labeled).length,
    samples: dataset.samples
  });
  const taskStatus = (kind) => {
    const task = kind === "label" ? label : preprocess;
    if (!task) return { task_id: null, status: "idle",
      progress: "", current: 0, total: 0 };
    task.polls++;
    if (task.polls >= 2) {
      task.status = "completed";
      task.current = task.total;
      task.progress = "Mock " + kind + " completed";
      if (kind === "label" && dataset) {
        dataset.samples = dataset.samples.map(s => ({ ...s, labeled: true }));
      }
    }
    return { ...task };
  };

  return async (req, url, respond) => {
    const path = url.pathname;
    if (!path.startsWith("/v1/dataset/")) return false;
    if (path === "/v1/dataset/scan" && req.method === "POST") {
      const input = await jsonBody(req);
      dataset = { name: input.dataset_name, samples: [
        sample(0, false), sample(1, false), sample(2, false)
      ] };
      respond({ code: 200, error: null, data: {
        message: "Mock dataset scanned", ...overview()
      } }); return true;
    }
    if (path === "/v1/dataset/load" && req.method === "POST") {
      const input = await jsonBody(req);
      if (input.dataset_path !== "/mock/saved.json") {
        respond({ detail: "Dataset not found" }, 400); return true;
      }
      dataset = { name: "loaded-mock", samples: [sample(0, true)] };
      respond({ code: 200, error: null, data: {
        message: "Loaded mock dataset", ...overview()
      } }); return true;
    }
    if (path === "/v1/dataset/auto_label_status" && req.method === "GET") {
      respond({ code: 200, error: null, data: taskStatus("label") }); return true;
    }
    if (path === "/v1/dataset/preprocess_status" && req.method === "GET") {
      respond({ code: 200, error: null, data: taskStatus("preprocess") }); return true;
    }
    if (!dataset) { respond({ detail: "No dataset loaded" }, 400); return true; }
    if (path === "/v1/dataset/samples" && req.method === "GET") {
      respond({ code: 200, error: null, data: overview() }); return true;
    }
    if (path === "/v1/dataset/save" && req.method === "POST") {
      const input = await jsonBody(req);
      respond({ code: 200, error: null, data: {
        message: "Saved dataset mock", save_path: input.save_path
      } }); return true;
    }
    const match = /^\/v1\/dataset\/sample\/(\d+)$/.exec(path);
    if (match && req.method === "PUT") {
      const input = await jsonBody(req);
      const index = Number(match[1]);
      if (input.sample_idx !== index || !dataset.samples[index]) {
        respond({ detail: "Invalid index" }, 400); return true;
      }
      dataset.samples[index] = { ...dataset.samples[index], ...input, index, labeled: true };
      respond({ code: 200, error: null, data: {
        message: "Updated mock sample", sample: dataset.samples[index]
      } }); return true;
    }
    if (path === "/v1/dataset/auto_label_async" && req.method === "POST") {
      await jsonBody(req);
      label = { task_id: "mock-label-" + (++sequence), status: "running",
        progress: "Labeling…", current: 0, total: dataset.samples.length, polls: 0 };
      respond({ code: 200, error: null, data: {
        task_id: label.task_id, message: "Mock labeling started", total: label.total
      } }); return true;
    }
    if (path === "/v1/dataset/preprocess_async" && req.method === "POST") {
      await jsonBody(req);
      preprocess = { task_id: "mock-preprocess-" + (++sequence), status: "running",
        progress: "Preprocessing…", current: 0,
        total: dataset.samples.filter(s => s.labeled).length, polls: 0 };
      respond({ code: 200, error: null, data: {
        task_id: preprocess.task_id, message: "Mock preprocessing started",
        total: preprocess.total
      } }); return true;
    }
    respond({ detail: "Unknown dataset route" }, 404);
    return true;
  };
}

