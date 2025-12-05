import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import Content from '../HomeContent.vue';

describe('Content', () => {
  it('renders scheduler container', () => {
    const wrapper = mount(Content, {
      global: {
        stubs: {
          DxScheduler: true,
          DxPopup: true,
          DxPosition: true,
          DxToolbarItem: true,
        },
      },
    });
    expect(wrapper.find('.scheduler-container').exists()).toBe(true);
  });
});
