import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createLogger} from './logger';

describe('createLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a logger with context', () => {
    const logger = createLogger('test');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should call console.info for info level', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('test');
    logger.info('test message');
    expect(spy).toHaveBeenCalled();
  });

  it('should call console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('test');
    logger.error('test error');
    expect(spy).toHaveBeenCalled();
  });

  it('should call console.warn for warn level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logger = createLogger('test');
    logger.warn('test warning');
    expect(spy).toHaveBeenCalled();
  });

  it('should include context in log output', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('myContext');
    logger.info('hello');
    const output = spy.mock.calls[0]?.[0] as string;
    expect(output).toContain('[myContext]');
  });

  it('should include data in log output', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = createLogger('test');
    logger.info('with data', {key: 'value'});
    const output = spy.mock.calls[0]?.[0] as string;
    expect(output).toContain('{"key":"value"}');
  });

  it('should include error details in error logs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logger = createLogger('test');
    const error = new Error('test error');
    logger.error('failed', error);
    const output = spy.mock.calls[0]?.[0] as string;
    expect(output).toContain('test error');
  });
});
