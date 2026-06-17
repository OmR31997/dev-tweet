import { debounce, throttle } from "@/lib/timing";

describe("throttle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("invokes immediately on the first call", () => {
    const fn = jest.fn();
    const limited = throttle(fn, 1_000);

    limited();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("suppresses calls inside the interval", () => {
    const fn = jest.fn();
    const limited = throttle(fn, 1_000);

    limited();
    limited();
    limited();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires a trailing call after the interval", () => {
    const fn = jest.fn();
    const limited = throttle(fn, 1_000);

    limited();
    limited("trailing");
    jest.advanceTimersByTime(1_000);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("trailing");
  });
});

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("waits for the quiet period before invoking", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on each call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    jest.advanceTimersByTime(200);
    debounced();
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
