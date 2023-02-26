"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const exceptions_1 = require("../common/exceptions");
const bad_request_exception_1 = require("../common/exceptions/bad-request.exception");
const workos_1 = require("../workos");
const mock = new axios_mock_adapter_1.default(axios_1.default);
const event = {
    action: 'document.updated',
    occurred_at: new Date(),
    actor: {
        id: 'user_1',
        name: 'Jon Smith',
        type: 'user',
    },
    targets: [
        {
            id: 'document_39127',
            type: 'document',
        },
    ],
    context: {
        location: ' 192.0.0.8',
        user_agent: 'Firefox',
    },
    metadata: {
        successful: true,
    },
};
const serializeEventOptions = (options) => (Object.assign(Object.assign({}, options), { occurred_at: options.occurred_at.toISOString() }));
describe('AuditLogs', () => {
    describe('createEvent', () => {
        describe('with an idempotency key', () => {
            it('includes an idempotency key with request', () => __awaiter(void 0, void 0, void 0, function* () {
                mock
                    .onPost('/audit_logs/events', {
                    event: serializeEventOptions(event),
                    organization_id: 'org_123',
                })
                    .replyOnce(201, { success: true });
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.createEvent('org_123', event, {
                    idempotencyKey: 'the-idempotency-key',
                })).resolves.toBeUndefined();
                expect(mock.history.post[0].headers['Idempotency-Key']).toEqual('the-idempotency-key');
            }));
        });
        describe('when the api responds with a 200', () => {
            it('returns void', () => __awaiter(void 0, void 0, void 0, function* () {
                mock
                    .onPost('/audit_logs/events', {
                    organization_id: 'org_123',
                    event: serializeEventOptions(event),
                })
                    .replyOnce(201, { success: true });
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.createEvent('org_123', event)).resolves.toBeUndefined();
            }));
        });
        describe('when the api responds with a 401', () => {
            it('throws an UnauthorizedException', () => __awaiter(void 0, void 0, void 0, function* () {
                mock
                    .onPost('/audit_logs/events', {
                    organization_id: 'org_123',
                    event: serializeEventOptions(event),
                })
                    .replyOnce(401, {
                    message: 'Unauthorized',
                }, { 'X-Request-ID': 'a-request-id' });
                const workos = new workos_1.WorkOS('invalid apikey');
                yield expect(workos.auditLogs.createEvent('org_123', event)).rejects.toStrictEqual(new exceptions_1.UnauthorizedException('a-request-id'));
            }));
        });
        describe('when the api responds with a 400', () => {
            it('throws an BadRequestException', () => __awaiter(void 0, void 0, void 0, function* () {
                const errors = [
                    {
                        field: 'occurred_at',
                        code: 'occurred_at must be an ISO 8601 date string',
                    },
                ];
                mock
                    .onPost('/audit_logs/events', {
                    organization_id: 'org_123',
                    event: serializeEventOptions(event),
                })
                    .replyOnce(400, {
                    message: 'Audit Log could not be processed due to missing or incorrect data.',
                    code: 'invalid_audit_log',
                    errors,
                }, { 'X-Request-ID': 'a-request-id' });
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.createEvent('org_123', event)).rejects.toThrow(bad_request_exception_1.BadRequestException);
            }));
        });
    });
    describe('createExport', () => {
        const serializeExportOptions = (_a) => {
            var { range_end, range_start } = _a, options = __rest(_a, ["range_end", "range_start"]);
            return (Object.assign({ range_start: range_start.toISOString(), range_end: range_end.toISOString() }, options));
        };
        describe('when the api responds with a 201', () => {
            it('returns `audit_log_export`', () => __awaiter(void 0, void 0, void 0, function* () {
                const options = {
                    organization_id: 'org_123',
                    range_start: new Date(),
                    range_end: new Date(),
                };
                const auditLogExport = {
                    object: 'audit_log_export',
                    id: 'audit_log_export_1234',
                    state: 'pending',
                    url: undefined,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mock
                    .onPost('/audit_logs/exports', serializeExportOptions(options))
                    .replyOnce(201, auditLogExport);
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.createExport(options)).resolves.toEqual(auditLogExport);
            }));
        });
        describe('when additional filters are defined', () => {
            it('returns `audit_log_export`', () => __awaiter(void 0, void 0, void 0, function* () {
                const options = {
                    actions: ['foo', 'bar'],
                    actors: ['Jon', 'Smith'],
                    organization_id: 'org_123',
                    range_end: new Date(),
                    range_start: new Date(),
                    targets: ['user', 'team'],
                };
                const auditLogExport = {
                    object: 'audit_log_export',
                    id: 'audit_log_export_1234',
                    state: 'pending',
                    url: undefined,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mock
                    .onPost('/audit_logs/exports', serializeExportOptions(options))
                    .replyOnce(201, auditLogExport);
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.createExport(options)).resolves.toEqual(auditLogExport);
            }));
        });
        describe('when the api responds with a 401', () => {
            it('throws an UnauthorizedException', () => __awaiter(void 0, void 0, void 0, function* () {
                const options = {
                    organization_id: 'org_123',
                    range_start: new Date(),
                    range_end: new Date(),
                };
                mock
                    .onPost('/audit_logs/exports', serializeExportOptions(options))
                    .replyOnce(401, {
                    message: 'Unauthorized',
                }, { 'X-Request-ID': 'a-request-id' });
                const workos = new workos_1.WorkOS('invalid apikey');
                yield expect(workos.auditLogs.createExport(options)).rejects.toStrictEqual(new exceptions_1.UnauthorizedException('a-request-id'));
            }));
        });
    });
    describe('getExport', () => {
        describe('when the api responds with a 201', () => {
            it('returns `audit_log_export`', () => __awaiter(void 0, void 0, void 0, function* () {
                const auditLogExport = {
                    object: 'audit_log_export',
                    id: 'audit_log_export_1234',
                    state: 'pending',
                    url: undefined,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                mock
                    .onGet(`/audit_logs/exports/${auditLogExport.id}`)
                    .replyOnce(200, auditLogExport);
                const workos = new workos_1.WorkOS('sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU');
                yield expect(workos.auditLogs.getExport(auditLogExport.id)).resolves.toEqual(auditLogExport);
            }));
        });
        describe('when the api responds with a 401', () => {
            it('throws an UnauthorizedException', () => __awaiter(void 0, void 0, void 0, function* () {
                mock.onGet('/audit_logs/exports/audit_log_export_1234').replyOnce(401, {
                    message: 'Unauthorized',
                }, { 'X-Request-ID': 'a-request-id' });
                const workos = new workos_1.WorkOS('invalid apikey');
                yield expect(workos.auditLogs.getExport('audit_log_export_1234')).rejects.toStrictEqual(new exceptions_1.UnauthorizedException('a-request-id'));
            }));
        });
    });
});
