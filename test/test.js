'use strict';
/*jshint node:true, laxcomma:true*/
/*global describe:true, it:true*/

var expect = require('expect.js')
  , fs = require('fs')
  , os = require('os');

describe('Mechanica Config', function(){
  describe('Config', function(){
    var config = require("../config.js");
    it('should return an object', function(){
      expect(config).to.be.an('object');
    });
    
    it('should return a proper set of rules', function(){
      expect(config).to.have.keys('there', 'will', 'be', 'hope');
      expect(config.hope).to.be('is what it\'s left');
    });
    
    it('should inherit properly', function () {
      expect(config).to.have.keys('will', 'no');
      expect(config.will).to.have.key('you');
      expect(config.no).to.have.key('one');
    });
    
    if (process.env.MECH_WATCH) {
      it('should listen for changes', function (done) {
        fs.writeFileSync('./config/' + os.hostname() + '.yml', 'watch: true', 'utf8');
        setTimeout(function () {
          expect(config.watch).to.be(true);
          fs.unlink('./config/' + os.hostname() + '.yml', done);
        }, 9000);
      });
    }
  });
});