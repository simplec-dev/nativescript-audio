import { Observable } from '@nativescript/core';
import { TNSRecordI } from '../common';
import { AudioRecorderOptions } from '../options';

@NativeClass()
export class TNSRecorderDelegate
  extends NSObject
  implements AVAudioRecorderDelegate {
  static ObjCProtocols = [AVAudioRecorderDelegate];
  private _owner: WeakRef<TNSRecorder>;

  static initWithOwner(owner: TNSRecorder) {
    const delegate = <TNSRecorderDelegate>TNSRecorderDelegate.new();
    delegate._owner = new WeakRef(owner);
    return delegate;
  }

  audioRecorderDidFinishRecording(recorder: any, success: boolean) {
    console.log(`audioRecorderDidFinishRecording: ${success}`);
    const owner = this._owner.get();
    if (owner) {
      // owner.notify({
      //   eventName: 'RecorderFinished',
      // })
    }
  }

  audioRecorderDidFinishRecordingSuccessfully(recorder: AVAudioRecorder, flag) {
    console.log(`audioRecorderDidFinishRecordingSuccessfully: ${flag}`);
    const owner = this._owner.get();
    if (owner) {
      // owner.notify({
      //   eventName: 'RecorderFinishedSuccessfully',
      // })
    }
  }
}

export class TNSRecorder extends Observable implements TNSRecordI {
  private _recorder: any;
  private _recordingSession: any;

  private _recorderOptions: AudioRecorderOptions;

  static CAN_RECORD(): boolean {
    return true;
  }

  get ios() {
    return this._recorder;
  }

  requestRecordPermission() {
    return new Promise((resolve, reject) => {
      this._recordingSession.requestRecordPermission((allowed: boolean) => {
        if (allowed) {
          resolve(true);
        } else {
          reject('Record permissions denied');
        }
      });
    });
  }

  start(options: AudioRecorderOptions): Promise<any> {
    this._recorderOptions = options;

    return new Promise((resolve, reject) => {
      try {
        this._recordingSession = AVAudioSession.sharedInstance();
        let errorRef = new interop.Reference();
        this._recordingSession.setCategoryError(
          AVAudioSessionCategoryPlayAndRecord,
          errorRef
        );
        if (errorRef) {
          console.error(`setCategoryError: ${errorRef.value}, ${errorRef}`);
        }

        this._recordingSession.setActiveError(true, null);
        this._recordingSession.requestRecordPermission((allowed: boolean) => {
          if (allowed) {
            // var recordSetting = new NSMutableDictionary((<any>[NSNumber.numberWithInt(kAudioFormatMPEG4AAC), NSNumber.numberWithInt((<any>AVAudioQuality).Medium.rawValue), NSNumber.numberWithFloat(16000.0), NSNumber.numberWithInt(1)]),
            //   (<any>["AVFormatIDKey", "AVEncoderAudioQualityKey", "AVSampleRateKey", "AVNumberOfChannelsKey"]));

            const recordSetting = NSMutableDictionary.alloc().init();

            if (options.format) {
                recordSetting.setValueForKey(NSNumber.numberWithInt(options.format), 'AVFormatIDKey');
            } else {
                recordSetting.setValueForKey(NSNumber.numberWithInt(kAudioFormatMPEG4AAC), 'AVFormatIDKey');
            }
            // recordSetting.setValueForKey(
            //   NSNumber.numberWithInt((<any>AVAudioQuality).Medium.rawValue),
            //   'AVEncoderAudioQualityKey'
            // );
            recordSetting.setValueForKey(
              NSNumber.numberWithInt(AVAudioQuality.Medium),
              'AVEncoderAudioQualityKey'
            );
            recordSetting.setValueForKey(
              NSNumber.numberWithFloat(16000.0),
              'AVSampleRateKey'
            );
            recordSetting.setValueForKey(
              NSNumber.numberWithInt(1),
              'AVNumberOfChannelsKey'
            );

            errorRef = new interop.Reference();

            const url = NSURL.fileURLWithPath(options.filename);

            this._recorder = (<any>(
              AVAudioRecorder.alloc()
            )).initWithURLSettingsError(url, recordSetting, errorRef);
            if (errorRef && errorRef.value) {
              console.error(
                `initWithURLSettingsError errorRef: ${errorRef.value}, ${errorRef}`
              );
            } else {
              this._recorder.delegate = TNSRecorderDelegate.initWithOwner(this);
              if (options.metering) {
                this._recorder.meteringEnabled = true;
              }
              if (options.maxDuration) {
                  this._recorder.recordForDuration(options.maxDuration / 1000);
              } else {
                  this._recorder.prepareToRecord();
                  this._recorder.record();
              }

              resolve();
            }
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  pause(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._recorder) {
          this._recorder.pause();
        }
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  resume(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._recorder) {
          this._recorder.record();
        }
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  stop(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._recorder) {
          this._recorder.stop();
        }
        // may need this in future
        // this._recordingSession.setActiveError(false, null);
        this._recorder.meteringEnabled = false;
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  dispose(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (this._recorder) {
          this._recorder.stop();
          this._recorder.meteringEnabled = false;
          this._recordingSession.setActiveError(false, null);
          this._recorder.release();
          this._recorder = undefined;
        }
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  isRecording() {
    return this._recorder && this._recorder.recording;
  }

  getMeters(channel?: number) {
    if (this._recorder) {
      if (!this._recorder.meteringEnabled) {
        this._recorder.meteringEnabled = true;
      }
      this._recorder.updateMeters();
      return this._recorder.averagePowerForChannel(channel);
    }
  }

  public audioRecorderDidFinishRecordingSuccessfully(recorder: any, success: boolean) {
    console.log(`audioRecorderDidFinishRecording: ${success}`);
    // Using values that match Android info call backs:
    // https://developer.android.com/reference/android/media/MediaRecorder#MEDIA_RECORDER_INFO_MAX_DURATION_REACHED
    // 800 is max duration, so that code gets a chance to handle the finished call
    if (success && this._recorderOptions.infoCallback) {
        var info = 800;
        var extra = 800;
        //this._recorderOptions.infoCallback({ recorder, info, extra });
    } else if (!success && this._recorderOptions.errorCallback) {
        var err = 1;
        var extra = 1;
        this._recorderOptions.errorCallback({ recorder, err, extra }); // since didn't succeed call error
    }
  }

    public audioRecorderErrorDidOccur(recorder: any, error: Error) {
        // Using values that match Android info call backs:
        // https://developer.android.com/reference/android/media/MediaRecorder#MEDIA_RECORDER_ERROR_UNKNOWN
        var err = 1;
        var extra = 1;
        if (this._recorderOptions.errorCallback) {
            this._recorderOptions.errorCallback({ recorder, err, extra });
        }
    }
}
