import RemoteSelect from "../RemoteSelect";

export default class MinistrySelect extends RemoteSelect {
  static schema(...extend) {
    return RemoteSelect.schema({
      type: 'ministrySelect',
      label: 'Ministry Select',
      key: 'ministrySelect',
      idPath: 'id',
      data: {
        url: '/ministry-names',
      },
      clearOnRefresh: false,
      limit: 100,
      dataSrc: 'url',
      valueProperty: '',
      lazyLoad: true,
      filter: '',
      searchEnabled: true,
      searchDebounce: 0.3,
      searchField: '',
      minSearch: 0,
      readOnlyValue: false,
      authenticate: false,
      ignoreCache: false,
      template: '<span>{{ item.label }}</span>',
      selectFields: '',
      selectThreshold: 0.3,
      uniqueOptions: false,
      tableView: true,
      fuseOptions: {
        include: 'score',
        threshold: 0.3,
      },
      validate: {
        onlyAvailableItems: false
      },
      indexeddb: {
        filter: {}
      },
      customOptions: {},
      useExactSearch: false,
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Ministry Select',
      group: 'basic',
      icon: 'th-list',
      weight: 70,
      documentation: '/userguide/forms/form-components#select',
      schema: MinistrySelect.schema()
    };
  }


}
