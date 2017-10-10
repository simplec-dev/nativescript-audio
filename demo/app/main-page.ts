import * as app from "tns-core-modules/application";
import { Color } from "tns-core-modules/color";
import * as platform from "tns-core-modules/platform";
import { AudioDemo } from "./main-view-model";

function pageLoaded(args) {
  var page = args.object;
  page.bindingContext = new AudioDemo(page);

  if (app.android && platform.device.sdkVersion >= "21") {
    var window = app.android.startActivity.getWindow();
    window.setNavigationBarColor(new Color("#C2185B").android);
  }
}
exports.pageLoaded = pageLoaded;
