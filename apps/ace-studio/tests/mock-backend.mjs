/**
 * @module mock-backend
 * @remarks Offline, disposable FastAPI-compatible simulation for web E2E.
 * @internal
 */
import http from "node:http";
import { createDatasetSimulator } from "./mock-dataset.mjs";

const port = Number(process.env.ACE_STUDIO_MOCK_PORT || 18081);
let sequence = 0;
const jobs = new Map();
let lastSubmittedRequest = null;
let trainingActive = false;
let lmInitialized = false;
let lastModelInit = null;
let lastTrainingExport = null;
const exportedAdapters = new Set();
const datasetSimulator = createDatasetSimulator();
const wrap = data => ({ code: 200, error: null, timestamp: Date.now(), data, extra: null });

const riff = (() => {
  const sampleCount = 4000, buffer = Buffer.alloc(44 + sampleCount * 2);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVEfmt ", 8); buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(8000, 24); buffer.writeUInt32LE(16000, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36); buffer.writeUInt32LE(sampleCount * 2, 40);
  return buffer;
})();

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  if (/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  const respond = (body, status = 200) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (url.pathname === "/__mock__/reset_lm" && req.method === "POST") {
    lmInitialized = false;
    respond(wrap({ llm_initialized: false })); return;
  }
  if (url.pathname === "/health" && req.method === "GET") {
    respond(wrap({ status: "ok", service: "ACE-Step API (mock)", version: "1.0",
      models_initialized: true, llm_initialized: lmInitialized })); return;
  }
  if (url.pathname === "/v1/models" && req.method === "GET") {
    respond(wrap({ models: [{ name: "acestep-v15-turbo", is_loaded: true, is_default: true,
      supported_task_types: ["text2music", "cover", "repaint"] },
      { name: "acestep-v15-base", is_loaded: false,
        supported_task_types: ["text2music", "cover", "repaint", "lego", "extract", "complete"] }],
      default_model: "acestep-v15-turbo",
      lm_models: [{ name: "acestep-5Hz-lm-0.6B", is_loaded: lmInitialized }],
      loaded_lm_model: lmInitialized ? "acestep-5Hz-lm-0.6B" : null,
      llm_initialized: lmInitialized })); return;
  }
  if (url.pathname === "/__mock__/last_model_init" && req.method === "GET") {
    respond(wrap(lastModelInit)); return;
  }
  if (url.pathname === "/v1/init" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    lastModelInit = body;
    if (body.init_llm === true) lmInitialized = true;
    respond(wrap({ message: "Model initialization completed", slot: 1,
      loaded_model: body.model,
      loaded_lm_model: body.init_llm ? body.lm_model_path : null,
      models: [{ name: "acestep-v15-turbo", is_loaded: true,
        supported_task_types: ["text2music", "cover", "repaint"] }],
      lm_models: [{ name: "acestep-5Hz-lm-0.6B", is_loaded: lmInitialized }],
      llm_initialized: lmInitialized })); return;
  }
  if (url.pathname === "/v1/training/status" && req.method === "GET") {
    respond(wrap({ is_training: trainingActive, should_stop: false,
      current_step: trainingActive ? 2 : 0, current_epoch: trainingActive ? 1 : 0,
      current_loss: trainingActive ? 0.12 : null,
      status: trainingActive ? "Training" : "Idle", tensor_dir: "/mock/tensors",
      config: {}, loss_history: [], training_log: "" })); return;
  }
  if (url.pathname === "/v1/training/load_tensor_info" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (body.tensor_dir !== "/mock/tensors") {
      respond({ detail: "Directory not found" }, 400); return;
    }
    respond(wrap({ dataset_name: "mock", num_samples: 3, custom_tag: "",
      tensor_dir: body.tensor_dir, message: "3 tensors available" })); return;
  }
  if ((url.pathname === "/v1/training/start" ||
       url.pathname === "/v1/training/start_lokr") && req.method === "POST") {
    trainingActive = true;
    respond(wrap({ message: "Training started" })); return;
  }
  if (url.pathname === "/__mock__/last_export" && req.method === "GET") {
    respond(wrap(lastTrainingExport)); return;
  }
  if (url.pathname === "/v1/studio/training/export" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    lastTrainingExport = body;
    if (exportedAdapters.has(body.export_path)) {
      respond({ detail: "Export destination already exists; no files replaced." }, 409); return;
    }
    exportedAdapters.add(body.export_path);
    respond(wrap({ message: "Mock adapter exported without overwrite",
      source: body.lora_output_dir, export_path: body.export_path })); return;
  }
  if (url.pathname === "/v1/training/stop" && req.method === "POST") {
    trainingActive = false;
    respond(wrap({ message: "Stopping training..." })); return;
  }
  if (await datasetSimulator(req, url, respond)) return;
  if (url.pathname === "/__mock__/last_submission" && req.method === "GET") {
    respond(wrap(lastSubmittedRequest)); return;
  }
  if (url.pathname === "/release_task" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    let prompt = "Generated example";
    try {
      lastSubmittedRequest = JSON.parse(raw);
      prompt = lastSubmittedRequest.prompt || prompt;
    } catch {
      lastSubmittedRequest = { contentType: req.headers["content-type"],
        multipartBody: raw.slice(0, 4000) };
    }
    const id = "mock-" + (++sequence);
    jobs.set(id, { prompt, polls: 0 });
    respond(wrap({ task_id: id, status: "queued", queue_position: 1 })); return;
  }
  if (url.pathname === "/query_result" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let ids = [];
    try { ids = JSON.parse(Buffer.concat(chunks).toString("utf8")).task_id_list || []; }
    catch { respond({ detail: "Malformed request" }, 400); return; }
    const result = ids.map(id => {
      const job = jobs.get(id);
      if (!job) return { task_id: id, status: 0, result: "[]" };
      job.polls++;
      if (job.polls < 2) return { task_id: id, status: 0,
        progress_text: "Sampling on mock backend", result: '[{"file":"","status":0}]' };
      return { task_id: id, status: 1, progress_text: "Done",
        result: JSON.stringify([{ file: "/v1/audio?path=%2Fmock%2Fsilence.wav",
          prompt: job.prompt, status: 1, seed_value: "42", metas: { bpm: 120 } }]) };
    });
    respond(wrap(result)); return;
  }
  if (url.pathname === "/v1/audio" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": riff.length });
    res.end(riff); return;
  }
  respond({ detail: "Unknown route" }, 404);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write("ACE Studio mock backend on http://127.0.0.1:" + port + "\n");
});






