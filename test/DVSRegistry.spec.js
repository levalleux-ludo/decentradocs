const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised).should();
const { expect, assert } = chai

var DVSRegistry = artifacts.require('DVSRegistry');

contract('Test DVSRegistry contract', function(accounts) {
    let dVSRegistry;
    it('connect DVSRegistry contract', async() => {
        dVSRegistry = await DVSRegistry.new();
        expect(await dVSRegistry.message()).to.eq('Hello World')
    })
    it('be able to change the message', async() => {
        await dVSRegistry.setMessage('Hello COVID-19');
        expect(await dVSRegistry.message()).to.not.eq('Hello World')
        expect(await dVSRegistry.message()).to.eq('Hello COVID-19')
    })
})