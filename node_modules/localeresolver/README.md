This module contains a locale resolver which is designed as middleware to be used with Express.  Locale resolver uses
a popular open source rules engine called Nools (JS) / Drools (Java ).

It is envisioned that your rules will have a dependency on the locale factory much like the default rules.
The locale factory should be created with files which contain the locales that your application can supported.
The resources directory contains examples of the files and their formats expected by locale factory.

Here is an example of creating the locale factory with those files:
```javascript
localeFactory = new G11nLocaleFactory( path.resolve(__dirname, '../example/resources/BCP47LocaleMapping.json'),
    path.resolve(__dirname, '../example/resources/CountryTimeZoneMapping.json'),
    path.resolve(__dirname, '../example/resources/SupportedLanguageMapping.json'),
    path.resolve(__dirname, '../example/resources/g11nProperties.json') );  OR

```
and then passing in the locale factory to the locale resolver middleware for your app:

```javascript
app.all(appPath, userMiddleware(), localeResolver.requestHandler(localeFactory), renderMiddlewareHandler() );

```
Please note that the format of the configuration files (BCP47LocaleMapping.json, CountryTimeZoneMapping.json,
SupportedLanguageMapping.json, and g11nProperties.json) used to construct the locale factory must be adhered to.

You can use the localeResolver directly as middleware or wrap the call to localeResolver in additional middleware.

After the locale resolver middleware executes,  the response.locals object will have a locale object attached:

```javascript
res.locals.locale = { bcp47Locale: 'es-ES-x-ES',
                      countryCode: 'ES',
                      language: 'es-ES',
                      locale: 'es_ES',
                      cldrLocale: 'es-ES',
                      supportedLanguages: [ 'es-ES', 'en-US' ],
                      timeZones:
                          [ 'Africa/Ceuta',
                            'Atlantic/Canary',
                            'Europe/Madrid',
                            'Europe/Berlin' ],
                      primaryTimeZone: 'Europe/Madrid' }


```
The locale resolver passes in a locale factors object and set of rules to the rule engine.  The default rules and
locale factors object function expect that if there is a logged in user then the request object has a user object
attached with the following attributes set:

```javascript
req.user = {
    preferredCountry: 'some iso 3166 country code value you previously retrieved',
    preferredLang: 'some  BCP-47 language value you previously retrieved'
}

```
You can override the rules file and locale factors object used by the rules by passing in options:

````javascript
var options = { ruleFile: path.resolve(__dirname, '<you RulesFile named whatever you like>.nools'),
                localeFactorsModule: path.resolve(__dirname, '<your LocaleFactors file named LocaleFactors>') };

localeResolver.requestHandler(options);

```
If you do override the defaults, then your locale factors object should be exported/named 'LocaleFactors' and you must
have the populateFactors function defined:

 ```javascript
 LocaleFactors.prototype.populateFactors = function populateFactors(req) {
 // your custom logic that populates a locale factors properties that are used by your custom rules
 }


```
Default locale rules is located in example/resources/localeResolution.nools and uses the following properties:


- If user is signed-in, user preferred country and language
- 'country' and/or 'lang' URL params http://<your host:port/your applicaton>?country=DE&lang=de_DE
- lang query param can be passed in as BCP47 format.
- browser 'accept-language' header



