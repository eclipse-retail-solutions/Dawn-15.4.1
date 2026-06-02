class UspMarquee extends HTMLElement {
  connectedCallback() {
    this._wrapper = this.querySelector('[data-wrapper]');
    this._content = this.querySelector('[data-content]');
    this._items  = this.querySelector('[data-items]');

    if (!this._wrapper || !this._content || !this._items) return;

    this._speedFactor = Number(this.dataset.speedFactor) || 25;

    // Double rAF ensures the element has been laid out before we measure it.
    requestAnimationFrame(() => requestAnimationFrame(() => this._init()));
  }

  disconnectedCallback() {
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }

  _init() {
    this._fill();

    this._onResize = this._debounce(() => this._fill(), 250);
    window.addEventListener('resize', this._onResize);

    this.addEventListener('pointerenter', () => {
      const anim = this._wrapper.getAnimations()[0];
      if (anim) anim.updatePlaybackRate(0);
    });
    this.addEventListener('pointerleave', () => {
      const anim = this._wrapper.getAnimations()[0];
      if (anim) anim.updatePlaybackRate(1);
    });
  }

  _fill() {
    const { _wrapper, _content, _items, _speedFactor } = this;

    // Remove previous copies before recalculating.
    _wrapper.querySelectorAll('[data-content-clone]').forEach((el) => el.remove());
    _content.querySelectorAll('[data-item-clone]').forEach((el) => el.remove());

    const marqueeWidth = this.offsetWidth;
    const itemsWidth  = _items.offsetWidth;

    if (itemsWidth === 0) return;

    const copies = Math.max(1, Math.ceil(marqueeWidth / itemsWidth));

    for (let i = 0; i < copies; i++) {
      const clone = _items.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-item-clone', '');
      _content.appendChild(clone);
    }

    // Duplicate the whole content block so the loop is seamless.
    const contentClone = _content.cloneNode(true);
    contentClone.setAttribute('aria-hidden', 'true');
    contentClone.setAttribute('data-content-clone', '');
    _wrapper.appendChild(contentClone);

    const speed = Math.sqrt(copies + 1) * _speedFactor;
    this.style.setProperty('--marquee-speed', `${speed}s`);
  }

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

if (!customElements.get('usp-marquee')) {
  customElements.define('usp-marquee', UspMarquee);
}
