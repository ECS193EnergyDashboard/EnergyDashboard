describe('test', function() {
  var $httpBackend;
  var sensor;
  var sensorData = {
      Rooms: [
        { }, { }, { }
      ]
  }

  // Add a custom equality tester before each test
  beforeEach(function() {
    jasmine.addCustomEqualityTester(angular.equals);
  });

  // Load the module that contains the `sensor` service before each test
  beforeEach(module('core.sensor'));

  // Instantiate the service and "train" `$httpBackend` before each test
  beforeEach(inject(function(_$httpBackend_, _sensor_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectPOST('https://ucd-pi-iis.ou.ad3.ucdavis.edu/piwebapi/batch').respond(sensorData);

    sensor = _sensor_;
  }));

  // Verify that there are no outstanding expectations or requests after each test
  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch the sensor data', function() {
    var data = sensor.query();

    expect(data).toEqual(undefined);

    $httpBackend.flush();
    expect(data.Rooms.length).toEqual(3);
  });

});