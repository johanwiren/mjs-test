# Mjs test framework

A tiny test framework for mjs on mongoose-os.

## Usage

Add this library as a dependecy in your `mos.yml` file:

```
libs:
  - origin: https://github.com/johanwiren/mjs-test
```

Add a configuration toggle in `mos.yml` enable testing mode:

```yaml
config_schema:
  - ["bank", "o", {hide: true}]
  - ["bank.test_mode", "b", false, {title: "Run only tests"}]
```

Build and flash your firmware to pull dependencies.

```
mos build --local --platform <your platform>
mos flash
```

Write some tests in `fs/bank_tests.js`:

```javascript
load('mjs_test.js');
load('bank.js');

// Tests
let s = TestSuite.create("bank_tests");
s.tests = [
    function() {
        // Given
        let account = Account.create();

        // When
        account.deposit(100);

        // Then
        assertTrue(account.hasMoney());
        assertFalse(account.isBankrupt());
        assertEqual(100, account.balance());
    }];
```

Run your tests in `init.js`:

```javascript
load('mjs_test.js');
load('api_config.js');

if (Cfg.get("bank.test_mode")) {

    print("Test mode only");
    load('bank_tests.js');

    print("Running test suites");
    TestRunner.runSuites();

} else {
    load('bank.js');
    // Your application initialisation goes here
}
```

Enable test mode:

```
mos config-set bank.test_mode=true
```

Upload your code and watch the tests complete in the console:

```
mos put fs/bank.js && mos put fs/init.js && mos call Sys.Reboot && mos console
...
[Dec  1 22:48:57.606] mgos_init            Init done, RAM: 295504 total, 222688 free, 222688 min free
[Dec  1 22:48:57.680] Test mode only 
[Dec  1 22:48:57.702] Registered suite: bank_tests 
[Dec  1 22:48:57.706] Running test suites 
[Dec  1 22:48:57.713] Running test suite bank_tests 
[Dec  1 22:48:57.731] {"result":"successful","tests":1,"suite":"bank_tests"} 
```

If you encounter errors you will get a stack trace and no further tests will be run:

```
[Dec  1 22:50:22.710] Running test suites 
[Dec  1 22:50:22.716] Running test suite bank_tests 
[Dec  1 22:50:22.731] Expected: 99 
[Dec  1 22:50:22.734] Actual: 100 
[Dec  1 22:50:22.737]   at mjs_test.js:57
[Dec  1 22:50:22.740]   at mjs_test.js:74
[Dec  1 22:50:22.742]   at bank_tests.js:25  <-- This is where the error was encountered
[Dec  1 22:50:22.744]   at mjs_test.js:37
[Dec  1 22:50:22.745]   at mjs_test.js:31
[Dec  1 22:50:22.747]   at mjs_test.js:14
[Dec  1 22:50:22.749]   at init.js:10
[Dec  1 22:50:22.752] MJS error: Assertion failed

```

## Bugs

There is currently no way to obtain a stack trace from within mjs. The only way to produce a stack trace is to call `die` which results in that the test runner stops running when the first failed test occurs.
