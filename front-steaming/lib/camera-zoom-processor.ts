import {
  Track,
  type TrackProcessor,
  type VideoProcessorOptions,
} from "livekit-client";

/** Crops the published camera track so zoom is visible to every viewer. */
export class CameraZoomProcessor
  implements TrackProcessor<Track.Kind.Video, VideoProcessorOptions>
{
  readonly name = "camera-zoom";
  processedTrack?: MediaStreamTrack;

  private canvas?: HTMLCanvasElement;
  private video?: HTMLVideoElement;
  private sourceTrack?: MediaStreamTrack;
  private frameId?: number;
  private zoom = 1;

  setZoom(value: number) {
    this.zoom = Math.min(4, Math.max(1, value));
  }

  async init({ track, element }: VideoProcessorOptions) {
    if (!(element instanceof HTMLVideoElement)) {
      throw new Error("Camera zoom requires a video element");
    }

    const settings = track.getSettings();
    const canvas = document.createElement("canvas");
    canvas.width = settings.width || 1280;
    canvas.height = settings.height || 720;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Camera zoom requires canvas support");

    this.video = element;
    this.sourceTrack = track;
    this.canvas = canvas;
    this.processedTrack = canvas.captureStream(30).getVideoTracks()[0];

    let wasCameraActive = true;
    const draw = () => {
      const video = this.video;
      const sourceTrack = this.sourceTrack;
      const cameraActive = sourceTrack?.readyState === "live" && sourceTrack.enabled;
      if (!cameraActive && wasCameraActive) {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      wasCameraActive = Boolean(cameraActive);
      if (this.processedTrack) {
        this.processedTrack.enabled = Boolean(cameraActive);
      }

      if (
        cameraActive &&
        video &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width && height) {
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }
          const cropWidth = width / this.zoom;
          const cropHeight = height / this.zoom;
          context.drawImage(
            video,
            (width - cropWidth) / 2,
            (height - cropHeight) / 2,
            cropWidth,
            cropHeight,
            0,
            0,
            width,
            height,
          );
        }
      }
      this.frameId = requestAnimationFrame(draw);
    };
    this.frameId = requestAnimationFrame(draw);
  }

  async restart({ track, element }: VideoProcessorOptions) {
    this.sourceTrack = track;
    if (element instanceof HTMLVideoElement) this.video = element;
  }

  async destroy() {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
    this.processedTrack?.stop();
    this.processedTrack = undefined;
    this.video = undefined;
    this.sourceTrack = undefined;
    this.canvas = undefined;
  }
}
