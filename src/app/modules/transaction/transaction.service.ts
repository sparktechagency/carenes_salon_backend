import QueryBuilder from '../../builder/QueryBuilder';
import Transaction from './transaction.model';

const getAllTransaction = async (query: Record<string, unknown>) => {
  const transactionQuery = new QueryBuilder(Transaction.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();

  const result = await transactionQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const getClientTransaction = async (
  shopId: string,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({
      $or: [{ senderEntityId: shopId }, { receiverEntityId: shopId }],
    }),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();

  const result = await transactionQuery.modelQuery;

  return {
    meta,
    result,
  };
};

const TransactionService = {
  getAllTransaction,
  getClientTransaction,
};

export default TransactionService;
