import { Components, Formio } from 'react-formio';
import _ from 'lodash';
import { WEB_BASE_URL } from "../../apiManager/endpoints/config";
import UserService from "../../services/UserService";

const SelectComponent = Components.components.select;

export default class RemoteSelect extends SelectComponent {
  static schema(...extend) {
    return SelectComponent.schema({
      type: 'remoteSelect',
      label: 'Remote Select',
      key: 'remoteSelect',
      idPath: 'id',
      data: {
        url: '',
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
      title: 'Remote Select',
      group: 'basic',
      icon: 'th-list',
      weight: 70,
      documentation: '/userguide/forms/form-components#select',
      schema: RemoteSelect.schema()
    };
  }

  loadItems(url, search, headers, options, method, body) {
    options = options || {};

    // See if we should load items or not.
    if ((!this.shouldLoad || this.options.readOnly) && !(this.component.widget === 'html5' && this.root.submission.state === 'submitted')) {
      this.isScrollLoading = false;
      this.loading = false;
      this.itemsLoadedResolve();
      return;
    }

    // See if they have not met the minimum search requirements.
    const minSearch = parseInt(this.component.minSearch, 10);
    if (
      this.component.searchField &&
      (minSearch > 0) &&
      (!search || (search.length < minSearch))
    ) {
      // Set empty items.
      return this.setItems([]);
    }

    // Ensure we have a method and remove any body if method is get
    method = method || 'GET';
    if (method.toUpperCase() === 'GET') {
      body = null;
    }

    const limit = this.component.limit || 100;
    const skip = this.isScrollLoading ? this.selectOptions.length : 0;
    const query = this.component.disableLimit ? {} : {
      limit,
      skip,
    };

    // Allow for url interpolation.
    url = this.interpolate(url, {
      formioBase: Formio.getBaseUrl(),
      search,
      limit,
      skip,
      page: Math.abs(Math.floor(skip / limit))
    });

    // Add search capability.
    if (this.component.searchField && search) {
      if (Array.isArray(search)) {
        query[`${this.component.searchField}`] = search.join(',');
      }
      else {
        query[`${this.component.searchField}`] = search;
      }
    }

    // If they wish to return only some fields.
    if (this.component.selectFields) {
      query.select = this.component.selectFields;
    }

    // Add sort capability
    if (this.component.sort) {
      query.sort = this.component.sort;
    }

    if (!_.isEmpty(query)) {
      // Add the query string.
      url += (!url.includes('?') ? '?' : '&') + Formio.serialize(query, (item) => this.interpolate(item));
    }

    // Add filter capability
    if (this.component.filter) {
      url += (!url.includes('?') ? '?' : '&') + this.interpolate(this.component.filter);
    }

    // Set ignoreCache if it is
    options.ignoreCache = this.component.ignoreCache;

    // Set the required headers for connecting to the form-flow-weapi endpoints
    headers = setFormFlowApiHeaders(headers);

    // Make the request.
    options.header = headers;
    this.loading = true;
    
    Formio.makeRequest(this.options.formio, 'select', url, method, body, options)
      .then((response) => {
        this.loading = false;
        this.error = null;
        this.setItems(response, !!search);
      })
      .catch((err) => {
        if (this.itemsFromUrl) {
          this.setItems([]);
          this.disableInfiniteScroll();
        }

        this.isScrollLoading = false;
        this.handleLoadingError(err);
      });
  }

  updateItems(searchInput, forceUpdate) {
    if (!this.component.data) {
      console.warn(`Select component ${this.key} does not have data configuration.`);
      this.itemsLoadedResolve();
      return;
    }

    // Only load the data if it is visible.
    if (!this.visible) {
      this.itemsLoadedResolve();
      return;
    }
    if (!forceUpdate && !this.active && !this.calculatedValue) {
      // If we are lazyLoading, wait until activated.
      this.itemsLoadedResolve();
      return;
    }
    let { url } = this.component.data;
    let method;
    let body;

    if (url.startsWith('/')) {
      // Adding the forms-flow-webapi base URL to the URL         
      url = WEB_BASE_URL + url;
    }

    if (!this.component.data.method) {
      method = 'GET';
    }
    else {
      method = this.component.data.method;
      if (method.toUpperCase() === 'POST') {
        body = this.component.data.body;
      }
      else {
        body = null;
      }
    }
    const options = this.component.authenticate ? {} : { noToken: true };
    this.loadItems(url, searchInput, this.requestHeaders, options, method, body);
  }
}

const setFormFlowApiHeaders = (headers) => {
  const clonedHeaders = _.cloneDeep(headers);
  clonedHeaders.map = {authorization: `Bearer ${UserService.getToken()}`};
  return clonedHeaders;
};
