let TestRunner = {
    test_suites: [],
    registerSuite: function(suite) {
        TestRunner.test_suites.splice(TestRunner.test_suites.length, 0, suite);
        print("Registered suite:", suite.name);
    },
    runSuites: function() {
        let results = [];
        let suite;
        let result;
        for (let i = 0; i < TestRunner.test_suites.length; i++) {
            suite = TestRunner.test_suites[i];
            print("Running test suite", suite.name);
            result = suite.run();
            print(JSON.stringify(result));
            results.splice(results.length, 0, result);
        }
        return results;
    }
};

let TestSuite = {
    _proto: {
        tests: [],
        setUp: function() {},
        tearDown: function() {},

        run: function() {
            for (let i = 0; i < this.tests.length; i++) {
                this.setUp();
                this.test(this.tests[i]);
                this.tearDown();
            }
            return this.report();
        },
        test: function(fn) {
            fn();
        },
        report: function() {
            return({"suite": this.name,
                    "tests": this.tests.length,
                    "result": "successful"});
        }
    },
    create: function(name) {
        let obj = Object.create(TestSuite._proto);
        obj.name = name;
        TestRunner.registerSuite(obj);
        return obj;
    }
};

// Assertions
let _assertFailed = function(expected, actual) {
    print("Expected:", expected);
    print("Actual:", actual);
    die("Assertion failed");
};

let assertTrue = function(bool) {
    if (!bool) {
        _assertFailed(true, bool);
    }
};

let assertFalse = function(bool) {
    if (bool) {
        _assertFailed(false, bool);
    }
};

let assertEqual = function(expected, actual) {
    if (expected !== actual) {
        _assertFailed(expected, actual);
    };
};

let assertNotEqual = function(a, b) {
    if (a === b) {
        // Somewhat ugly
        _assertFailed("NotEqual", JSON.stringify({"equal?": true, "values": [a, b]}));
    };
};
