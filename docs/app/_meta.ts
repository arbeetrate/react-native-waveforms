export default {
  '-- intro': {
    type: 'separator',
    title: 'Get started',
  },
  index: 'Home',
  'getting-started': 'Installation',
  '-- components': {
    type: 'separator',
    title: 'Components',
  },
  // Flatten the components/ folder's children up into this nav level so
  // each component sits directly under the "Components" separator
  // (instead of inside a collapsible "Components" folder).
  components: {
    display: 'children',
  },
  '-- reference': {
    type: 'separator',
    title: 'Reference',
  },
  api: 'API reference',
};

