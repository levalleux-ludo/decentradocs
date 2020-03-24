const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised).should();
const { expect, assert } = chai
const { v4: uuidv4 } = require('uuid');

var DVSRegistry = artifacts.require('DVSRegistry');


const ERROR_GENERIC = 'VM Exception while processing transaction\: revert';
const REASON_GIVEN = '\-\- Reason given\:';

function createExceptionMessage(reason, addReasonGiven = true) {
    if (addReasonGiven) {
        return new RegExp(ERROR_GENERIC + ' ' + reason + ' ' + REASON_GIVEN + ' ' + reason);
    } else {
        return new RegExp(ERROR_GENERIC + ' ' + reason);
    }
}


contract('Fake test', function(accounts) {
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


contract('Test DVSRegistry contract', function(accounts) {
    let dVSRegistry;
    const doc1 = {
        docId: uuidv4(),
        encryptedKey: uuidv4(),
        authorized: [],
        subscriptionFee: 123456
    }
    const doc2 = {
        docId: uuidv4(),
        encryptedKey: uuidv4(),
        authorized: [accounts[1], accounts[2]],
        subscriptionFee: 0
    }
    const ERROR_NOT_ALLOWED_TO_GET_KEY = createExceptionMessage('not allowed to get the key for this document', false);

    it('be able to register a protected document', async() => {
        dVSRegistry = await DVSRegistry.new();
        expect(await dVSRegistry.docExists(doc1.docId)).to.be.false;
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.false;
        await dVSRegistry.registerDoc(doc1.docId, doc1.encryptedKey, doc1.authorized, { from: accounts[0] });
        expect(await dVSRegistry.docExists(doc1.docId)).to.be.true;
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.false;
    })
    it('not be able to regsiter the same document again', async() => {
        expect(false).to.be.true
    })
    it('be able to get encryption key if owner', async() => {
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] }).should.be.rejectedWith(ERROR_NOT_ALLOWED_TO_GET_KEY);
    })
    it('be able to get encryption key if authorized', async() => {
        await dVSRegistry.registerDoc(doc2.docId, doc2.encryptedKey, doc2.authorized, { from: accounts[0] });
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.true;
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[0] })).to.eq(doc2.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[1] })).to.eq(doc2.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[2] })).to.eq(doc2.encryptedKey);
        await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[3] }).should.be.rejectedWith(ERROR_NOT_ALLOWED_TO_GET_KEY);
    })
    it('be able to add authorized address to a document if owner', async() => {
        await dVSRegistry.setAccess(doc1.docId, [accounts[1]], [], { from: accounts[0] });
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq(doc1.encryptedKey);
        await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] }).should.be.rejectedWith(ERROR_NOT_ALLOWED_TO_GET_KEY);
    })
    it('not be able to authorized address if not owner', async() => {
        expect(false).to.be.true
    })
    it('be able to deny address if owner', async() => {
        expect(false).to.be.true
    })
    it('not be able to deny address if not owner', async() => {
        expect(false).to.be.true
    })
})
