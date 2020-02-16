import { Observable } from 'tns-core-modules/data/observable';

export interface AudioPlayerOptions {
  /**
   * The audio file to play.
   */
  audioFile: string;

  /**
   * Set true to loop audio playback.
   */
  loop: boolean;

  /**
   * Prevent autoplay if desired as player autoplays be default
   */
  autoPlay?: boolean;

  /**
   * Set true to enable audio metering.
   */
  metering?: boolean;

  /**
   * Callback to execute when playback has completed.
   * @returns {Object} An object containing the native values for the callback.
   */
  completeCallback?: Function;

  /**
   * Callback to execute when playback has an error.
   * @returns {Object} An object containing the native values for the error callback.
   */
  errorCallback?: Function;

  /**
   * Callback to execute when info is emitted from the player.
   * @returns {Object} An object containing the native values for the info callback.
   */
  infoCallback?: Function;
}

export interface AudioRecorderOptions {
  /**
   * The name of the file recorded.
   */
  filename: string;

  /**
   * The audio source to record *** ANDROID ONLY for now ***
   * https://developer.android.com/reference/android/media/MediaRecorder.AudioSource.html
   */
  source?: any;

  /**
   * The max duration of the audio recording.
   */
  maxDuration?: number;

  /**
   * Set true to enable audio metering.
   */
  metering?: boolean;

  /**
   * The format of the audio recording.
   */
  format?: any;
  channels?: any;
  sampleRate?: any;
  bitRate?: any;
  encoder?: any;

  /**
   * Callback to execute when playback has an error.
   * @returns {Object} An object containing the native values for the error callback.
   */
  errorCallback?: Function;

  /**
   * Callback to execute when info is emitted from the player.
   * @returns {Object} An object containing the native values for the info callback.
   */
  infoCallback?: Function;
}
export interface TNSPlayerI {
  readonly ios?: any;
  readonly android?: any;

  /**
   * Set to true to enable console log output for debugging.
   */
  debug: boolean;

  /**
   * Volume getter/setter
   */
  volume: any;

  /**
   * Duration getter
   */
  duration: number;

  initFromFile(options: AudioPlayerOptions): Promise<any>;
  /**
   * Starts playing audio file from local app files.
   */
  playFromFile(options: AudioPlayerOptions): Promise<any>;

  initFromUrl(options: AudioPlayerOptions): Promise<any>;

  /**
   * Starts playing audio file from url
   */
  playFromUrl(options: AudioPlayerOptions): Promise<any>;

  /**
   * Play audio file.
   */
  play(): Promise<boolean>;

  /**
   * Pauses playing audio file.
   */
  pause(): Promise<boolean>;

  /**
   * Resume audio player.
   */
  resume(): void;

  /**
   * Seeks to specific time.
   */
  seekTo(time: number): Promise<any>;

  /**
   * Releases resources from the audio player.
   */
  dispose(): Promise<boolean>;

  /**
   * Check if the audio is actively playing.
   */
  isAudioPlaying(): boolean;

  /**
   * Get the duration of the audio file playing.
   */
  getAudioTrackDuration(): Promise<string>;

  /**
   * Sets the player playback speed rate. On Android this works on API 23+.
   * @param speed [number] - The speed of the playback.
   */
  changePlayerSpeed(speed: number): void;

  /**
   * ** iOS ONLY ** - Begins playback at a certain delay, relative to the current playback time.
   * @param time [number] - The time to start playing the audio track at.
   */
  playAtTime(time: number);
}
export interface TNSRecordI {
  start(options: AudioRecorderOptions): Promise<any>;
  pause(): Promise<any>;
  resume(): Promise<any>;
  stop(): Promise<any>;
  dispose(): Promise<any>;
}
export declare class TNSPlayer {
  static ObjCProtocols: any[];
  readonly ios: any;
  readonly android: any;
  readonly events: Observable;

  /**
   * Set to true to enable console log output for debugging.
   */
  debug: boolean;

  /**
   * Volume getter/setter
   */
  volume: any;

  /**
   * duration
   */
  duration: number;

  /**
   * current time
   */
  readonly currentTime: number;

  initFromFile(options: AudioPlayerOptions): Promise<any>;

  /**
   * Starts playing audio file from local app files.
   */
  playFromFile(options: AudioPlayerOptions): Promise<any>;
  initFromUrl(options: AudioPlayerOptions): Promise<any>;

  /**
   * Starts playing audio file from url
   */
  playFromUrl(options: AudioPlayerOptions): Promise<any>;

  /**
   * Play audio file.
   */
  play(): Promise<boolean>;

  /**
   * Pauses playing audio file.
   */
  pause(): Promise<boolean>;

  /**
   * Resume audio player.
   */
  resume(): void;

  /**
   * Seeks to specific time in seconds.
   * @param time [number] - The position of the track duration to seek to.
   */
  seekTo(time: number): Promise<any>;

  /**
   * Releases resources from the audio player.
   */
  dispose(): Promise<boolean>;

  /**
   * Check if the audio is actively playing.
   */
  isAudioPlaying(): boolean;

  /**
   * Get the duration of the audio file playing.
   */
  getAudioTrackDuration(): Promise<string>;

  /**
   * Android Only
   * Will set the playback speed for Android 23+, this is not available on lower Android APIs.
   * @param speed [number] - The speed of the playback.
   */
  changePlayerSpeed(speed: number): void;

  audioPlayerDidFinishPlayingSuccessfully(player?: any, flag?: boolean): void;
}

export declare class TNSRecorder {
  static ObjCProtocols: any[];
  private _recorder;
  private _recordingSession;
  readonly ios: any;
  readonly android: any;

  /**
   * Set to true to enable console log output for debugging.
   */
  debug: boolean;

  /**
   * Returns true if the device is capable of recording, false otherwise.
   */
  static CAN_RECORD(): boolean;

  /**
   * Android Only
   * Returns true if the RECORD_AUDIO permission has been granted.
   */
  hasRecordPermission(): boolean;

  /**
   * Android Only
   * Promise will resolve if the user grants the permission or if the permission has already been granted.
   */
  requestRecordPermission(): Promise<any>;

  /**
   * Starts a recording session with the provided options.
   * @param options [AudioRecorderOptions]
   */
  start(options: AudioRecorderOptions): Promise<any>;

  /**
   * Pauses the recorder.
   */
  pause(): Promise<any>;

  /**
   * Resumes the recorder.
   */
  resume(): Promise<any>;

  /**
   * Stops the recording.
   */
  stop(): Promise<any>;

  /**
   * Disposes of the recorder session.
   */
  dispose(): Promise<any>;

  /**
   * Returns the maximum absolute amplitude that was sampled since the last call to this method.
   * @param channel [number]
   */
  getMeters(channel?: number): any;

  /**
   * iOS Only
   * Returns value indicating the recorder is currently recording.
   */
  isRecording(): any;
  audioRecorderDidFinishRecording(recorder: any, success: boolean): void;
}

export interface IAudioPlayerEvents {
  seek: 'seek';
  paused: 'paused';
  started: 'started';
}
export const AudioPlayerEvents: IAudioPlayerEvents;
