/**
 * Transaction manager types and interface
 * Provides transactional execution for operations that must be atomic
 */

/**
 * Callback function type for transaction operations
 * Receives the transaction client and returns a result
 */
export type TransactionCallback<T> = (tx: any) => Promise<T>

/**
 * Transaction manager interface
 * Implementations provide atomic transaction execution with rollback on failure
 */
export interface ITransactionManager {
  /**
   * Execute a callback within a transaction
   * If the callback throws, the entire transaction is rolled back
   * @param callback - Function to execute within the transaction
   * @returns The result of the callback
   */
  execute<T>(callback: TransactionCallback<T>): Promise<T>
}
