import { SimpleSynthesizerPage } from './app.po';

describe('simple-synthesizer App', function() {
  let page: SimpleSynthesizerPage;

  beforeEach(() => {
    page = new SimpleSynthesizerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
