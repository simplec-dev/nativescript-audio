import { TNSPlayerI } from "../common";
import { AudioPlayerOptions } from "../options";
import { isString } from "tns-core-modules/utils/types";
import { knownFolders, path } from "tns-core-modules/file-system";
import * as app from "tns-core-modules/application";
import * as utils from "tns-core-modules/utils/utils";

// var utils = require('utils/utils');

declare var NSURLSession,
  AVAudioPlayer,
  NSURL,
  AVAudioPlayerDelegate,
  AVAudioSession,
  AVAudioSessionPortOverrideSpeaker,
  AVAudioSessionCategoryPlayAndRecord;

export class TNSPlayer extends NSObject implements TNSPlayerI {
  public static ObjCProtocols = [AVAudioPlayerDelegate];
  private _player: AVAudioPlayer;
  private _task: any;
  private _completeCallback: any;
  private _errorCallback: any;
  private _infoCallback: any;

  get ios(): any {
    return this._player;
  }

  public initFromFile(options: AudioPlayerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      // init only
      options.autoPlay = false;
      this.playFromFile(options).then(resolve, reject);
    });
  }

  public playFromFile(options: AudioPlayerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      // only if not explicitly set, default to true
      if (options.autoPlay !== false) options.autoPlay = true;

      try {
        let audioPath;

        let fileName = isString(options.audioFile)
          ? options.audioFile.trim()
          : "";
        if (fileName.indexOf("~/") === 0) {
          fileName = path.join(
            knownFolders.currentApp().path,
            fileName.replace("~/", "")
          );
        }

        this._completeCallback = options.completeCallback;
        this._errorCallback = options.errorCallback;
        this._infoCallback = options.infoCallback;

        var audioSession = AVAudioSession.sharedInstance();
        let output = audioSession.currentRoute.outputs.lastObject.portType;

        if (output.match(/Receiver/)) {
          try {
            audioSession.setCategoryError(AVAudioSessionCategoryPlayAndRecord);
            audioSession.overrideOutputAudioPortError(
              AVAudioSessionPortOverrideSpeaker
            );
            audioSession.setActiveError(true);
            //console.log("audioSession category set and active");
          } catch (err) {
            //console.log("setting audioSession category failed");
          }
        }

        this._player = AVAudioPlayer.alloc().initWithContentsOfURLError(
          NSURL.fileURLWithPath(fileName)
        );
        this._player.delegate = this;

        if (options.metering) {
          this._player.meteringEnabled = true;
        }

        if (options.loop) {
          this._player.numberOfLoops = -1;
        }

        if (options.autoPlay) this._player.play();

        resolve();
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public initFromUrl(options: AudioPlayerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      // init only
      options.autoPlay = false;
      this.playFromUrl(options).then(resolve, reject);
    });
  }

  public playFromUrl(options: AudioPlayerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      // only if not explicitly set, default to true
      if (options.autoPlay !== false) options.autoPlay = true;

      try {
        let sharedSession = utils.ios.getter(
          NSURLSession,
          NSURLSession.sharedSession
        );

        this._task = sharedSession.dataTaskWithURLCompletionHandler(
          NSURL.URLWithString(options.audioFile),
          (data, response, error) => {
            if (error !== null) {
              if (this._errorCallback) {
                this._errorCallback({ error });
              }

              reject();
            }

            this._completeCallback = options.completeCallback;
            this._errorCallback = options.errorCallback;
            this._infoCallback = options.infoCallback;

            var audioSession = AVAudioSession.sharedInstance();
            let output = audioSession.currentRoute.outputs.lastObject.portType;

            if (output.match(/Receiver/)) {
              try {
                audioSession.setCategoryError(
                  AVAudioSessionCategoryPlayAndRecord
                );
                audioSession.overrideOutputAudioPortError(
                  AVAudioSessionPortOverrideSpeaker
                );
                audioSession.setActiveError(true);
                //console.log("audioSession category set and active");
              } catch (err) {
                //console.log("setting audioSession category failed");
              }
            }

            this._player = (<any>AVAudioPlayer.alloc()).initWithDataError(
              data,
              null
            );
            if (this._player) {
              // this is added because player is null when network is slow or non existent
              this._player.delegate = this;
              this._player.numberOfLoops = options.loop ? -1 : 0;
  
              if (options.metering) {
                this._player.meteringEnabled = true;
              }
  
              if (options.autoPlay) this._player.play();
  
              resolve();
            } else {
              reject();
            }
          }
        );

        this._task.resume();
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public pause(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._player && this._player.playing) {
          this._player.pause();
          resolve(true);
        }
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public play(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isAudioPlaying()) {
          this._player.play();
          resolve(true);
        }
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public resume(): void {
    if (this._player) this._player.play();
  }

  public playAtTime(time: number): void {
    if (this._player) {
      this._player.playAtTime(time);
    }
  }

  public seekTo(time: number): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._player) {
          this._player.currentTime = time;
          resolve(true);
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public get volume(): number {
    return this._player ? this._player.volume : 0;
  }

  public set volume(value: number) {
    if (this._player) {
      this._player.volume = value;
    }
  }

  public dispose(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._player && this.isAudioPlaying()) {
          this._player.stop();
        }
        this.reset();
        resolve();
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public isAudioPlaying(): boolean {
    return this._player ? this._player.playing : false;
  }

  public getAudioTrackDuration(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        var duration = this._player ? this._player.duration : 0;
        resolve(duration.toString());
      } catch (ex) {
        if (this._errorCallback) {
          this._errorCallback({ ex });
        }
        reject(ex);
      }
    });
  }

  public audioPlayerDidFinishPlayingSuccessfully(player?: any, flag?: boolean) {
    if (flag && this._completeCallback) {
      this._completeCallback({ player, flag });
    } else if (!flag && this._errorCallback) {
      this._errorCallback({ player, flag });
    }
  }

  public audioPlayerDecodeErrorDidOccurError(player: any, error: NSError) {
    if (this._errorCallback) {
      this._errorCallback({ player, error });
    }
  }

  private reset() {
    if (this._player) {
      this._player = undefined;
    }
    if (this._task) {
      this._task.cancel();
      this._task = undefined;
    }
  }

  public get currentTime(): number {
    return this._player ? this._player.currentTime : 0;
  }
}
