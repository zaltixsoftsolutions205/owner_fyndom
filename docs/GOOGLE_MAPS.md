Setup Google Maps API key for EAS builds

1) Store the key securely in EAS (recommended)

Run locally (you must be logged in to EAS):

  eas secret:create --name GOOGLE_MAPS_API_KEY --value "AIzaSyDFiI_i4qwCtrXAp_RhYyHyu2rD4IsjNjE"

This will make the key available at build time as `process.env.GOOGLE_MAPS_API_KEY`.

2) app.config.js

You already added `app.config.js` which injects the env var into the Android config:

```js
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY || ""
      }
    }
  }
});
```

3) Restrict the API key in Google Cloud Console

- Enable: Maps SDK for Android
- Restrict key to package name: `com.ashok1rrr.Hostel_ownerApp`
- Add the SHA-1 fingerprint of the keystore used for the release build (EAS keystore). See next step to obtain SHA-1.

4) Getting the release SHA-1 (EAS)

- From EAS Dashboard: Project → Credentials → Android Keystore → view SHA-1.
- Or using CLI (download keystore and run):

  keytool -list -v -keystore <keystore.jks> -alias <alias> -storepass <password>

5) Rebuild

  eas build --platform android --profile production

6) Test

- Install the produced APK/AAB and check that the hostel location screen no longer crashes.

Notes

- Do NOT keep the API key hard-coded in `app.json` (you already removed it).
- If you need a quick temporary mitigation, we can render a placeholder instead of `MapView` on Android release builds while you finish the key + rebuild.