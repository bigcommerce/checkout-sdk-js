import RequestFactory from './request-factory';

describe('RequestFactory', () => {
    let requestFactory;
    let url;

    beforeEach(() => {
        url = 'http://foobar/v1/endpoint';

        global.XMLHttpRequest = function XMLHttpRequestMock() {
            this.open = jest.fn();
            this.setRequestHeader = jest.fn();
        };

        requestFactory = new RequestFactory();
    });

    describe('#createRequest()', () => {
        it('returns XHR object', () => {
            const xhr = requestFactory.createRequest(url);

            expect(xhr instanceof XMLHttpRequest).toEqual(true);
        });

        it('configures XHR object with options', () => {
            const xhr = requestFactory.createRequest(url, {
                credentials: true,
                timeout: 2000,
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            });

            expect(xhr.withCredentials).toEqual(true);
            expect(xhr.timeout).toEqual(2000);
            expect(xhr.open).toHaveBeenCalledWith('GET', url, true);
            expect(xhr.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json, text/plain, */*');
            expect(xhr.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        });

        it('configures XHR object with parameterized URL', () => {
            const xhr = requestFactory.createRequest(url, {
                method: 'GET',
                params: {
                    foobar: 'foobar',
                    bar: 'bar',
                },
            });

            expect(xhr.open).toHaveBeenCalledWith('GET', `${url}?bar=bar&foobar=foobar`, true);
        });
    });
});
