/**
 * @module source-audio
 * @remarks Convert authenticated browser audio blobs to accurately named upload files.
 * @public
 */

/**
 * @public Repackage generated server audio for a follow-on source upload.
 * @remarks The filename extension follows the MIME type rather than assuming WAV.
 */
export function audioBlobToSourceFile(blob: Blob): File {
  const type = blob.type.toLowerCase();
  const extension = type.includes("mpeg") ? "mp3"
    : type.includes("flac") ? "flac"
    : type.includes("ogg") ? "ogg"
    : type.includes("opus") ? "opus"
    : type.includes("aac") ? "aac"
    : type.includes("wav") ? "wav" : "audio";
  return new File([blob], "ace-result." + extension, {
    type: blob.type || "application/octet-stream"
  });
}

