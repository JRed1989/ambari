/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Observable} from 'rxjs/Observable';
import {Store, Action} from '@ngrx/store';
import {AppSettings} from '@app/models/app-settings.model';
import {AppState} from '@app/models/app-state.model';
import {AuditLog} from '@app/models/audit-log.model';
import {ServiceLog} from '@app/models/service-log.model';
import {BarGraph} from '@app/models/bar-graph.model';
import {Graph} from '@app/models/graph.model';
import {Node} from '@app/models/node.model';
import {UserConfig} from '@app/models/user-config.model';
import {Filter} from '@app/models/filter.model';
import {AuditLogField} from '@app/models/audit-log-field.model';
import {ServiceLogField} from '@app/models/service-log-field.model';

export const storeActions = {
  'ARRAY.ADD': 'ADD',
  'ARRAY.DELETE.PRIMITIVE': 'DELETE_PRIMITIVE',
  'ARRAY.DELETE.OBJECT': 'DELETE_OBJECT',
  'ARRAY.CLEAR': 'CLEAR',
  'ARRAY.MAP': 'MAP',

  'OBJECT.SET': 'SET'
};

export interface AppStore {
  appSettings: AppSettings;
  appState: AppState;
  auditLogs: AuditLog[];
  serviceLogs: ServiceLog[];
  serviceLogsHistogramData: BarGraph[];
  graphs: Graph[];
  hosts: Node[];
  userConfigs: UserConfig[];
  filters: Filter[];
  clusters: string[];
  components: string[];
  serviceLogsFields: ServiceLogField[];
  auditLogsFields: AuditLogField[];
}

export class ModelService {

  constructor(modelName: string, store: Store<AppStore>) {
    this.modelName = modelName;
    this.store = store;
  }

  protected modelName: string;

  protected store: Store<AppStore>;

  getAll(): Observable<any> {
    return this.store.select(this.modelName);
  }

}

export class CollectionModelService extends ModelService {

  addInstance(instance: any): void {
    this.addInstances([instance]);
  }

  addInstances(instances: any[]): void {
    this.store.dispatch({
      type: `${storeActions['ARRAY.ADD']}_${this.modelName}`,
      payload: instances
    });
  }

  deleteObjectInstance(instance: any): void {
    this.store.dispatch({
      type: `${storeActions['ARRAY.DELETE.OBJECT']}_${this.modelName}`,
      payload: instance
    });
  }

  deletePrimitiveInstance(instance: any): void {
    this.store.dispatch({
      type: `${storeActions['ARRAY.DELETE.PRIMITIVE']}_${this.modelName}`,
      payload: instance
    });
  }

  clear(): void {
    this.store.dispatch({
      type: `${storeActions['ARRAY.CLEAR']}_${this.modelName}`
    });
  }

  mapCollection(modifier: (item: any) => {}): void {
    this.store.dispatch({
      type: `${storeActions['ARRAY.MAP']}_${this.modelName}`,
      payload: {
        modifier: modifier
      }
    });
  }

}

export class ObjectModelService extends ModelService {

  getParameter(key: string): Observable<any> {
    return this.store.select(this.modelName, key);
  }

  setParameter(key: string, value: any): void {
    let payload = {};
    payload[key] = value;
    this.setParameters(payload);
  }

  setParameters(params: any): void {
    this.store.dispatch({
      type: `${storeActions['OBJECT.SET']}_${this.modelName}`,
      payload: params
    });
  }

}

export function getCollectionReducer(modelName: string, defaultState: any = []): any {
  return (state: any = defaultState, action: Action) => {
    switch (action.type) {
      case `${storeActions['ARRAY.ADD']}_${modelName}`:
        return [...state, ...action.payload];
      case `${storeActions['ARRAY.DELETE.OBJECT']}_${modelName}`:
        return state.filter(instance => instance.id !== action.payload.id);
      case `${storeActions['ARRAY.DELETE.PRIMITIVE']}_${modelName}`:
        return state.filter(item => item !== action.payload);
      case `${storeActions['ARRAY.CLEAR']}_${modelName}`:
        return [];
      case `${storeActions['ARRAY.MAP']}_${modelName}`:
        return state.map(action.payload.modifier);
      default:
        return state;
    }
  };
}

export function getObjectReducer(modelName: string, defaultState: any = {}) {
  return (state: any = defaultState, action: Action): any => {
    switch (action.type) {
      case `${storeActions['OBJECT.SET']}_${modelName}`:
        return Object.assign({}, state, action.payload);
      default:
        return state;
    }
  };
}
