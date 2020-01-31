import getBrowserInfo from './get-browser-info';

describe('getBrowserInfo()', () => {
    it('retrieves browser info', () => {
        expect(getBrowserInfo())
            .toEqual(expect.objectContaining({
                color_depth: expect.any(Number),
                java_enabled: expect.any(Boolean),
                language: expect.any(String),
                screen_height: expect.any(Number),
                screen_width: expect.any(Number),
                time_zone_offset: expect.any(String),
            }));
    });
});
