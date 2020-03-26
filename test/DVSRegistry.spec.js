const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised).should();
const { expect, assert } = chai
const { v4: uuidv4 } = require('uuid');

var DVSRegistry = artifacts.require('DVSRegistry');


const ERROR_GENERIC = 'VM Exception while processing transaction\: revert';
const REASON_GIVEN = '\-\- Reason given\:';
const PUBLIC_KEY = '00000-00000-00000-00000-00000';

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
        subscriptionFee: 123456,
        authorized: []
    }
    const doc2 = {
        docId: uuidv4(),
        encryptedKey: uuidv4(),
        subscriptionFee: 0,
        authorized: [accounts[1], accounts[2]]
    }
    const doc3_public = {
        docId: uuidv4(),
        encryptedKey: PUBLIC_KEY,
        subscriptionFee: 0,
        authorized: []
    }
    const ERROR_NOT_ALLOWED_TO_GET_KEY = createExceptionMessage('not allowed to get the key for this document', false);
    const ERROR_DOC_ALREADY_EXISTS = createExceptionMessage('a document with this id already exists', false);
    const ERROR_DOC_DOES_NOT_EXISTS = createExceptionMessage('this document has not been registered', false);
    const ERROR_ONLY_AUTHOR_ALLOWED = createExceptionMessage('only the author of the document can change authorisations', false);
    const ERROR_ALREADY_SUBSCRIBED = createExceptionMessage('account has already subscribed to this document', false);
    const ERROR_NOT_ENOUGH_FEE = createExceptionMessage('not enough fee to subscribe to this document', false);
    const ERROR_ONLY_OWNER = createExceptionMessage('only contract owner can call this method', false);
    const ERROR_AMOUNT_TOO_HIGH = createExceptionMessage('requested amount too high compared to actual balance', false);

    it('be able to register a protected document', async() => {
        dVSRegistry = await DVSRegistry.new({ from: accounts[0] });
        expect(await dVSRegistry.docExists(doc1.docId)).to.be.false;
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.false;
        await dVSRegistry.registerDoc(doc1.docId, doc1.encryptedKey, doc1.subscriptionFee, doc1.authorized, { from: accounts[0] });
        expect(await dVSRegistry.docExists(doc1.docId)).to.be.true;
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.false;
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.length).to.be.eq(doc1.authorized.length);
        expect(await dVSRegistry.getAuthor(doc1.docId)).to.be.eq(accounts[0]);
    })
    it('not be able to regsiter the same document again', async() => {
        await dVSRegistry.registerDoc(doc1.docId, doc1.encryptedKey, doc1.subscriptionFee, doc1.authorized, { from: accounts[0] }).should.be.rejectedWith(ERROR_DOC_ALREADY_EXISTS);;
    })
    it('be able to get encryption key if author', async() => {
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq('');
    })
    it('be able to get encryption key if authorized', async() => {
        await dVSRegistry.registerDoc(doc2.docId, doc2.encryptedKey, doc2.subscriptionFee, doc2.authorized, { from: accounts[0] });
        expect(await dVSRegistry.docExists(doc2.docId)).to.be.true;
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[0] })).to.eq(doc2.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[1] })).to.eq(doc2.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[2] })).to.eq(doc2.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[3] })).to.eq('');
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc2.docId);
        expect(authorized.length).to.be.eq(doc2.authorized.length);
        expect(await dVSRegistry.getAuthor(doc2.docId)).to.be.eq(accounts[0]);
    })
    it('be able to get encryption key if key is public_key', async() => {
        await dVSRegistry.registerDoc(doc3_public.docId, doc3_public.encryptedKey, doc3_public.subscriptionFee, doc3_public.authorized, { from: accounts[0] });
        expect(await dVSRegistry.docExists(doc3_public.docId)).to.be.true;
        expect(await dVSRegistry.getDocumentKey(doc3_public.docId, { from: accounts[0] })).to.eq(doc3_public.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc3_public.docId, { from: accounts[1] })).to.eq(doc3_public.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc3_public.docId, { from: accounts[2] })).to.eq(doc3_public.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc3_public.docId, { from: accounts[3] })).to.eq(doc3_public.encryptedKey);
    })
    it('be able to add authorized address to a document if author', async() => {
        await dVSRegistry.setAccess(doc1.docId, [accounts[1], accounts[3]], [], { from: accounts[0] });
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.length).to.be.eq(2);
        expect(authorized.includes(accounts[1])).to.be.true;
        expect(authorized.includes(accounts[3])).to.be.true;
        expect(authorized.includes(accounts[2])).to.be.false;
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[3] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq('');
    })
    it('not be able to add authorized address if not author', async() => {
        await dVSRegistry.setAccess(doc1.docId, [accounts[2]], [], { from: accounts[1] }).should.be.rejectedWith(ERROR_ONLY_AUTHOR_ALLOWED);
    })
    it('be able to deny address if author', async() => {
        await dVSRegistry.setAccess(doc1.docId, [], [accounts[1], accounts[2]], { from: accounts[0] });
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.length).to.be.eq(1);
        expect(authorized.includes(accounts[1])).to.be.false;
        expect(authorized.includes(accounts[2])).to.be.false;
        expect(authorized.includes(accounts[3])).to.be.true;
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[3] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq('');
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq('');
    })
    it('be able to mix authorized/denied address to a document if author', async() => {
        await dVSRegistry.setAccess(doc1.docId, [accounts[1], accounts[2], accounts[4]], [accounts[3], accounts[4]], { from: accounts[0] });
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.length).to.be.eq(2);
        expect(authorized.includes(accounts[1])).to.be.true;
        expect(authorized.includes(accounts[2])).to.be.true;
        expect(authorized.includes(accounts[3])).to.be.false;
        expect(authorized.includes(accounts[4])).to.be.false;
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[0] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq(doc1.encryptedKey);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[3] })).to.eq('');
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[4] })).to.eq('');
        await dVSRegistry.setAccess(doc1.docId, [accounts[3], accounts[4]], [accounts[1], accounts[2]], { from: accounts[0] });
        authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.length).to.be.eq(2);
        expect(authorized.includes(accounts[1])).to.be.false;
        expect(authorized.includes(accounts[2])).to.be.false;
        expect(authorized.includes(accounts[3])).to.be.true;
        expect(authorized.includes(accounts[4])).to.be.true;
    })
    it('not be able to deny address if not author', async() => {
        await dVSRegistry.setAccess(doc1.docId, [], [accounts[2]], { from: accounts[3] }).should.be.rejectedWith(ERROR_ONLY_AUTHOR_ALLOWED);
    })
    it('be able to subscribe to a free document', async() => {
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[3] })).to.eq('');
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc2.docId);
        expect(authorized.includes(accounts[3])).to.be.false;
        await dVSRegistry.subscribe(doc2.docId, { from: accounts[3] });
        expect(await dVSRegistry.getDocumentKey(doc2.docId, { from: accounts[3] })).to.eq(doc2.encryptedKey);
        authorized = await dVSRegistry.getAuthorizedAccounts(doc2.docId);
        expect(authorized.includes(accounts[3])).to.be.true;
    })
    it('not be able to subscribe twice to a document', async() => {
        await dVSRegistry.subscribe(doc2.docId, { from: accounts[3] }).should.be.rejectedWith(ERROR_ALREADY_SUBSCRIBED);
        await dVSRegistry.subscribe(doc2.docId, { from: accounts[2] }).should.be.rejectedWith(ERROR_ALREADY_SUBSCRIBED);
    })
    it('not be able to subscribe to a document if author', async() => {
        await dVSRegistry.subscribe(doc2.docId, { from: accounts[0] }).should.be.rejectedWith(ERROR_ALREADY_SUBSCRIBED);
    })
    it('be able to subscribe to a paid document', async() => {
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq('');
        let authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.includes(accounts[1])).to.be.false;
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[1], value: doc1.subscriptionFee });
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[1] })).to.eq(doc1.encryptedKey);
        authorized = await dVSRegistry.getAuthorizedAccounts(doc1.docId);
        expect(authorized.includes(accounts[1])).to.be.true;
    })
    it('not be able to subscribe for less than subscription fee', async() => {
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq('');
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[2], value: 0 }).should.be.rejectedWith(ERROR_NOT_ENOUGH_FEE);
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[2], value: doc1.subscriptionFee - 1 }).should.be.rejectedWith(ERROR_NOT_ENOUGH_FEE);
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[2], value: 0 }).should.be.rejectedWith(ERROR_NOT_ENOUGH_FEE);
    })
    it('be able to subscribe for more than subscription fee', async() => {
        let balance = await web3.eth.getBalance(dVSRegistry.address)
        expect(balance).to.equal("0")
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq('');
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[2], value: doc1.subscriptionFee + 1 });
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[2] })).to.eq(doc1.encryptedKey);
        balance = await web3.eth.getBalance(dVSRegistry.address)
        expect(balance).to.equal("1")
    })
    it('not be able to withdraw funds from contract if not contract owner', async() => {
        let cBalance = await web3.eth.getBalance(dVSRegistry.address)
        expect(cBalance).to.equal("1")
        let uBalanceBefore = await web3.eth.getBalance(accounts[1])
        console.log("balance before", uBalanceBefore);
        await dVSRegistry.withdraw(1, accounts[1], { from: accounts[2] }).should.be.rejectedWith(ERROR_ONLY_OWNER)
        let uBalanceAfter = await web3.eth.getBalance(accounts[1])
        console.log("balance after", uBalanceAfter);
        expect(uBalanceAfter).to.be.eq(uBalanceBefore);
    })
    it('not be able to withdraw more than the actual contract balance', async() => {
        let cBalance = await web3.eth.getBalance(dVSRegistry.address)
        expect(cBalance).to.equal("1")
        let uBalanceBefore = await web3.eth.getBalance(accounts[1])
        console.log("balance before", uBalanceBefore);
        await dVSRegistry.withdraw(2, accounts[1], { from: accounts[0] }).should.be.rejectedWith(ERROR_AMOUNT_TOO_HIGH)
        let uBalanceAfter = await web3.eth.getBalance(accounts[1])
        console.log("balance after", uBalanceAfter);
        expect(uBalanceAfter).to.be.eq(uBalanceBefore);
    })
    it('be able to withdraw funds from contract to another address if owner only', async() => {
        let cBalance = await web3.eth.getBalance(dVSRegistry.address)
        expect(cBalance).to.equal("1")
        let uBalanceBefore = await web3.eth.getBalance(accounts[1])
        console.log("balance before", uBalanceBefore);
        await dVSRegistry.withdraw(1, accounts[1], { from: accounts[0] });
        let uBalanceAfter = await web3.eth.getBalance(accounts[1])
        console.log("balance after", uBalanceAfter);
        expect(uBalanceAfter).to.be.not.eq(uBalanceBefore);
        balance = await web3.eth.getBalance(dVSRegistry.address)
        expect(balance).to.equal("0")
    })
    it('be able to consult subscription fee', async() => {
        let fee = await dVSRegistry.getSubscriptionFee(doc1.docId);
        expect(fee.toNumber()).to.equal(doc1.subscriptionFee);
        fee = await dVSRegistry.getSubscriptionFee(doc2.docId);
        expect(fee.toNumber()).to.equal(doc2.subscriptionFee);
        await dVSRegistry.getSubscriptionFee(uuidv4()).should.be.rejectedWith(ERROR_DOC_DOES_NOT_EXISTS);
    })
    it('be able to change subscription fee if author', async() => {
        let fee = await dVSRegistry.getSubscriptionFee(doc1.docId);
        expect(fee.toNumber()).to.equal(doc1.subscriptionFee);
        await dVSRegistry.setSubscriptionFee(doc1.docId, 654321, { from: accounts[0] });
        fee = await dVSRegistry.getSubscriptionFee(doc1.docId);
        expect(fee.toNumber()).to.equal(654321);
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[5] })).to.eq('');
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[5], value: doc1.subscriptionFee }).should.be.rejectedWith(ERROR_NOT_ENOUGH_FEE);
        await dVSRegistry.subscribe(doc1.docId, { from: accounts[5], value: 654321 });
        expect(await dVSRegistry.getDocumentKey(doc1.docId, { from: accounts[5] })).to.eq(doc1.encryptedKey);
    })
    it('npt be able to change subscription fee if not author', async() => {
        let fee = await dVSRegistry.getSubscriptionFee(doc1.docId);
        expect(fee.toNumber()).to.equal(654321);
        await dVSRegistry.setSubscriptionFee(doc1.docId, 654321, { from: accounts[1] }).should.be.rejectedWith(ERROR_ONLY_AUTHOR_ALLOWED);
        fee = await dVSRegistry.getSubscriptionFee(doc1.docId);
        expect(fee.toNumber()).to.equal(654321);
    })
})