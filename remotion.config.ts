import {Config} from '@remotion/cli/config';

// Output defaults for every lesson render (YouTube Shorts / TikTok / Reels friendly)
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Optional: point Remotion at an already-installed Chrome Headless Shell
// (otherwise Remotion downloads its own on first render).
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
