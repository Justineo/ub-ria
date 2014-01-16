/**
 * UB RIA Base
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 数据模型基类
 * @author otakustay
 * @date $DATE$
 */
define(
    function (require) {
        var u = require('underscore');
        var util = require('er/util');
        var UIModel = require('ef/UIModel');

        /**
         * 业务数据模型基类
         *
         * @extends ef.UIModel
         * @constructor
         */
        function BaseModel() {
            UIModel.apply(this, arguments);
        }

        util.inherits(BaseModel, UIModel);

        function extendLastObjectTypeValue(array, extension) {
            var lastObject = array[array.length - 1];
            if (u.isArray(lastObject)) {
                extendLastObjectTypeValue(lastObject, extension);
            }
            else {
                // 这里也一样，必须变成一个新对象，以避免多次覆盖过来的影响
                array[array.length - 1] = u.defaults({}, extension, lastObject);
            }
        }

        /**
         * 合并默认数据源
         */
        BaseModel.prototype.mergeDefaultDatasource = function () {
            if (!this.datasource) {
                return;
            }

            // 管它有没有必要，先深复制一份，这样下面就不会为各种情况纠结，
            // `datasource`大不到哪里去，深复制不影响性能
            var datasource = u.deepClone(this.datasource) || {};
            var defaultDatasource = u.deepClone(this.defaultDatasource);

            // 默认数据源可能是对象或者数组，当前的数据源也可能是对象或数组，按以下规则：
            //
            // - 默认数组 + 当前数组：将当前数组连接到默认的最后
            // - 默认数组 + 当前对象：将当前对象和数组中最后一个是对象的东西合并
            // - 默认对象 + 当前数组：将默认放在数组第1个
            // - 默认对象 + 当前对象：做对象的合并
            if (u.isArray(defaultDatasource)) {
                // 默认数组 + 当前数组
                if (u.isArray(datasource)) {
                    datasource = defaultDatasource.concat(datasource);
                }
                // 默认数组 + 当前对象
                else {
                    extendLastObjectTypeValue(defaultDatasource, datasource);
                    datasource = defaultDatasource;
                }
            }
            else {
                // 默认对象 + 当前数组
                if (u.isArray(datasource)) {
                    if (!u.contains(datasource, defaultDatasource)) {
                        // 其它的数据项有可能会依赖这个属性，因此需要放在最前面
                        datasource.unshift(defaultDatasource);
                    }
                }
                // 默认对象 + 当前对象
                else {
                    u.defaults(datasource, defaultDatasource);
                }
            }

            this.datasource = datasource;
        };

        /**
         * 加载数据
         *
         * @return {er/Promise}
         */
        BaseModel.prototype.load = function () {
            this.mergeDefaultDatasource();

            return UIModel.prototype.load.apply(this, arguments);
        };

        return BaseModel;
    }
);
