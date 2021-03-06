const StellarSdk = require('stellar-sdk');

// account should be in the format of StellarSdk.Account
// keypair should be in the format of StellarSdk.Keypair
module.exports = async function deleteAllOffers(Server, account, keypair) {
  // Get the offer IDs
  const offersForTarget = await Server.offers('accounts', keypair.accountId())
    .order('asc')
    .limit(20)
    .call();

  if (offersForTarget.records.length === 0) {
    return 0;
  }

  let transaction = new StellarSdk.TransactionBuilder(account);
  console.log(`Deleting ${offersForTarget.records.length} offers for ${keypair.accountId()}`);
  offersForTarget.records.forEach((record) => {
    const offerId = record.id;
    transaction = transaction.addOperation(StellarSdk.Operation.manageOffer({
      // It doesn't matter who the issuer is since this is just going to get deleted
      buying: StellarSdk.Asset.native(),
      selling: new StellarSdk.Asset('0000', account.accountId()),
      amount: '0',
      price: '1',
      offerId,
    }));
  });

  // transaction = transaction.addMemo(StellarSdk.Memo.text(`bookmaker ${version}`));
  transaction = transaction.build();

  transaction.sign(keypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  // console.log(transaction.toEnvelope().toXDR('base64'));

  const transactionResult = await Server.submitTransaction(transaction);
  // console.log(JSON.stringify(transactionResult, null, 2));
  // console.log('\nSuccess! View the transaction at: ');
  // console.log(transactionResult._links.transaction.href);
  return offersForTarget.records.length;
};
