import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleFirestoreError, OperationType, auth } from './firebase';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  initializeFirestore: vi.fn(),
  persistentLocalCache: vi.fn(),
  persistentMultipleTabManager: vi.fn(),
  doc: vi.fn(),
  getDocFromServer: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
}));

describe('handleFirestoreError', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Reset auth mock state
    Object.defineProperty(auth, 'currentUser', {
      value: null,
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should format Error object correctly', () => {
    const error = new Error('Test error');

    expect(() => handleFirestoreError(error, OperationType.GET, 'test/path')).toThrow(Error);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const loggedStr = consoleErrorSpy.mock.calls[0][1];
    const loggedObj = JSON.parse(loggedStr);

    expect(loggedObj).toMatchObject({
      error: 'Test error',
      operationType: OperationType.GET,
      path: 'test/path',
      authInfo: {}
    });
  });

  it('should handle non-Error objects (e.g. strings)', () => {
    const errorMsg = 'String error';

    expect(() => handleFirestoreError(errorMsg, OperationType.WRITE, 'other/path')).toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const loggedStr = consoleErrorSpy.mock.calls[0][1];
    const loggedObj = JSON.parse(loggedStr);

    expect(loggedObj).toMatchObject({
      error: 'String error',
      operationType: OperationType.WRITE,
      path: 'other/path',
      authInfo: {}
    });
  });

  it('should include authInfo when user is logged in', () => {
    const error = new Error('Auth error');

    Object.defineProperty(auth, 'currentUser', {
      value: { uid: 'user123', email: 'test@example.com' },
      writable: true,
      configurable: true
    });

    expect(() => handleFirestoreError(error, OperationType.CREATE, null)).toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const loggedStr = consoleErrorSpy.mock.calls[0][1];
    const loggedObj = JSON.parse(loggedStr);

    expect(loggedObj).toMatchObject({
      error: 'Auth error',
      operationType: OperationType.CREATE,
      path: null,
      authInfo: {
        userId: 'user123',
        email: 'test@example.com'
      }
    });
  });

  it('should throw an error with the stringified JSON as its message', () => {
     const error = new Error('Some error');
     let caughtError;

     try {
       handleFirestoreError(error, OperationType.DELETE, 'del/path');
     } catch (err) {
       caughtError = err;
     }

     expect(caughtError).toBeInstanceOf(Error);
     expect(() => JSON.parse((caughtError as Error).message)).not.toThrow();
     const parsedMsg = JSON.parse((caughtError as Error).message);
     expect(parsedMsg).toMatchObject({
         error: 'Some error',
         operationType: OperationType.DELETE,
         path: 'del/path'
     });
  });
});
