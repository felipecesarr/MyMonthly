# Third-party notices

The application-specific terms in `LICENSE` apply to original MyMonthly application code. Third-party components retain their own copyrights and licenses; this repository does not relicense them or restrict rights already granted by their owners.

## Runtime and development dependencies

`package.json` and `bun.lock` identify the external packages and versions used by the application. They are installed separately; their source is not vendored in this repository. The preparation audit inspected 48 installed direct runtime/development package manifests: 47 declared MIT and TypeScript declared Apache-2.0. This is a direct-dependency inventory, not a complete transitive software bill of materials. Preserve upstream notices whenever redistributing dependency code or application binaries.

Copies of licenses relevant to the generated native projects/build tooling are provided in `THIRD_PARTY_LICENSES/`:

- `React-Native-MIT.txt`: React Native / Meta and contributors.
- `Expo-MIT.txt`: Expo and contributors.
- `Apache-2.0.txt`: Apache License 2.0, applicable to Gradle wrapper files that identify that license in their existing headers, and TypeScript.

Existing copyright/license headers in Android, Gradle wrapper and iOS generated sources remain in place and take precedence for those files. MyMonthly's application license does not replace those upstream terms.

## Names, logos and artwork

Bank and platform names or logos visible in the interface/onboarding artwork remain the property of their respective holders. Their appearance identifies supported services or illustrates the interface; no trademark or logo license, affiliation, sponsorship or endorsement is granted by this repository.

MyMonthly name, branding and original marketing artwork are not licensed as a separate right to market or impersonate the published MyMonthly application. Any rights to application code are governed by `LICENSE`.

An unreferenced Sequel Sans font binary was excluded from this public preparation because no redistribution license accompanied it. This repository does not distribute that commercial font.

## Demonstration material

Onboarding screenshots are marketing/demo artwork, not a production database export. No personal email address, telephone number, account/card number or payment identifier was observed in the visual preparation review. Financial amounts displayed in illustrations should not be interpreted as verified real financial records.
