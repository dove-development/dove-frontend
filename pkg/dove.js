let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(takeObject(mem.getUint32(i, true)));
    }
    return result;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getDataViewMemory0();
    for (let i = 0; i < array.length; i++) {
        mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

export function initializePanicHook() {
    wasm.initializePanicHook();
}

/**
 * Initialize Javascript logging and panic handler
 */
export function solana_program_init() {
    wasm.solana_program_init();
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_3(addHeapObject(e));
    }
}

export const OracleKind = Object.freeze({ ZeroFeed:0,"0":"ZeroFeed",Pyth:1,"1":"Pyth",Switchboard:2,"2":"Switchboard",UserFeed:3,"3":"UserFeed", });

export const Validity = Object.freeze({ Fresh:0,"0":"Fresh",Stale:1,"1":"Stale", });

const AccountWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_accountwasm_free(ptr >>> 0, 1));

export class AccountWasm {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AccountWasm.prototype);
        obj.__wbg_ptr = ptr;
        AccountWasmFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AccountWasmFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_accountwasm_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.accountwasm_get_key(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {boolean}
     */
    is_signer() {
        const ret = wasm.accountwasm_is_signer(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    is_writable() {
        const ret = wasm.accountwasm_is_writable(this.__wbg_ptr);
        return ret !== 0;
    }
}

const AuctionConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_auctionconfig_free(ptr >>> 0, 1));
/**
 * Configuration for a Dutch auction.
 *
 * Example config: `begin_scale = 1.5`, `decay_rate = 0.9995`, `end_scale = 0.15`.
 *
 * The auction is started `50%` above market price and decays by `0.05%` per second.
 *
 * Market price is hit at `t = 810 seconds` or `13.5 minutes`.
 *
 * The auction fails at `15%` of market price at `t = 4050 seconds` or `67.5 minutes`.
 */
export class AuctionConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(AuctionConfig.prototype);
        obj.__wbg_ptr = ptr;
        AuctionConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AuctionConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_auctionconfig_free(ptr, 0);
    }
    /**
     * @param {number} beginScale
     * @param {number} decayRate
     * @param {number} endScale
     */
    constructor(beginScale, decayRate, endScale) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.auctionconfig_new(retptr, beginScale, decayRate, endScale);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            AuctionConfigFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {AuctionConfig}
     */
    static zero() {
        const ret = wasm.auctionconfig_zero();
        return AuctionConfig.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    get beginScale() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get decayRate() {
        const ret = wasm.auctionconfig_decayRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get endScale() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
}

const AuthorityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_authority_free(ptr >>> 0, 1));

export class Authority {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AuthorityFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_authority_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} program_key
     * @returns {Uint8Array}
     */
    static deriveKey(program_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program_key, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.authority_deriveKey(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const AuthorityCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_authoritycreate_free(ptr >>> 0, 1));
/**
 * Creates a new authority account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (paying for account creation)
 * 1. `[writable]` Authority account (PDA, will be created)
 * 2. `[]` System program
 */
export class AuthorityCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AuthorityCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_authoritycreate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.authoritycreate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.authoritycreate_getAccounts(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const BookFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_book_free(ptr >>> 0, 1));

export class Book {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Book.prototype);
        obj.__wbg_ptr = ptr;
        BookFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BookFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_book_free(ptr, 0);
    }
    /**
     * @param {BookConfig} config
     * @param {number} unixTimestamp
     * @returns {number}
     */
    projectTotal(config, unixTimestamp) {
        _assertClass(config, BookConfig);
        const ret = wasm.book_projectTotal(this.__wbg_ptr, config.__wbg_ptr, unixTimestamp);
        return ret;
    }
    /**
     * @param {BookConfig} config
     * @param {number} unixTimestamp
     * @returns {number}
     */
    projectRewards(config, unixTimestamp) {
        _assertClass(config, BookConfig);
        const ret = wasm.book_projectRewards(this.__wbg_ptr, config.__wbg_ptr, unixTimestamp);
        return ret;
    }
    /**
     * @returns {number}
     */
    get creationTime() {
        const ret = wasm.book_creationTime(this.__wbg_ptr);
        return ret;
    }
}

const BookConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_bookconfig_free(ptr >>> 0, 1));
/**
 * Configuration for a Book
 */
export class BookConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(BookConfig.prototype);
        obj.__wbg_ptr = ptr;
        BookConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BookConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bookconfig_free(ptr, 0);
    }
    /**
     * @param {InterestRate} interestRate
     * @param {Schedule} rewardSchedule
     */
    constructor(interestRate, rewardSchedule) {
        _assertClass(interestRate, InterestRate);
        var ptr0 = interestRate.__destroy_into_raw();
        _assertClass(rewardSchedule, Schedule);
        var ptr1 = rewardSchedule.__destroy_into_raw();
        const ret = wasm.bookconfig_new(ptr0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        BookConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {InterestRate}
     */
    get interestRate() {
        const ret = wasm.bookconfig_interestRate(this.__wbg_ptr);
        return InterestRate.__wrap(ret);
    }
    /**
     * @returns {Schedule}
     */
    get rewardSchedule() {
        const ret = wasm.bookconfig_rewardSchedule(this.__wbg_ptr);
        return Schedule.__wrap(ret);
    }
}

const CollateralFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_collateral_free(ptr >>> 0, 1));

export class Collateral {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Collateral.prototype);
        obj.__wbg_ptr = ptr;
        CollateralFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CollateralFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_collateral_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} collateralMintKey
     * @returns {Uint8Array}
     */
    static deriveKey(programKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.collateral_deriveKey(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Collateral}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.collateral_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Collateral.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Oracle}
     */
    get oracle() {
        const ret = wasm.collateral_oracle(this.__wbg_ptr);
        return Oracle.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    get decimals() {
        const ret = wasm.collateral_decimals(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get deposited() {
        const ret = wasm.collateral_deposited(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get maxDeposit() {
        const ret = wasm.collateral_maxDeposit(this.__wbg_ptr);
        return ret;
    }
}

const CollateralCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_collateralcreate_free(ptr >>> 0, 1));
/**
 * Creates a new collateral type in the system
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account (paying for account creation)
 * 1. `[writable]` Collateral account (PDA, will be created)
 * 2. `[writable]` Safe account (PDA, will be created)
 * 3. `[]` Authority account (PDA)
 * 4. `[]` World account (PDA)
 * 5. `[]` Mint account (for the collateral token)
 * 6. `[]` System program
 * 7. `[]` SPL Token program
 */
export class CollateralCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CollateralCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_collateralcreate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.collateralcreate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.collateralcreate_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const CollateralSetOracleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_collateralsetoracle_free(ptr >>> 0, 1));
/**
 * Sets the oracle for a collateral account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Collateral account (PDA)
 * 2. `[]` World account (PDA)
 */
export class CollateralSetOracle {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CollateralSetOracleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_collateralsetoracle_free(ptr, 0);
    }
    /**
     * @param {OracleKind} oracleKind
     * @param {Uint8Array} oracleKey
     * @returns {Uint8Array}
     */
    static getData(oracleKind, oracleKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(oracleKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.collateralsetoracle_getData(retptr, oracleKind, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.collateralsetoracle_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const CollateralUpdateMaxDepositFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_collateralupdatemaxdeposit_free(ptr >>> 0, 1));
/**
 * Updates the maximum deposit limit for a collateral account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Collateral account (PDA)
 * 2. `[]` World account (PDA)
 */
export class CollateralUpdateMaxDeposit {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CollateralUpdateMaxDepositFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_collateralupdatemaxdeposit_free(ptr, 0);
    }
    /**
     * @param {number} newMaxDeposit
     * @returns {Uint8Array}
     */
    static getData(newMaxDeposit) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.collateralupdatemaxdeposit_getData(retptr, newMaxDeposit);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.collateralsetoracle_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_config_free(ptr >>> 0, 1));

export class Config {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Config.prototype);
        obj.__wbg_ptr = ptr;
        ConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_config_free(ptr, 0);
    }
    /**
     * @param {number} maxLtv
     * @param {InterestRate} dvdInterestRate
     * @param {Oracle} doveOracle
     * @param {AuctionConfig} auctionConfig
     * @param {BookConfig} debtConfig
     * @param {FlashMintConfig} flashMintConfig
     * @param {OfferingConfig} offeringConfig
     * @param {BookConfig} savingsConfig
     * @param {VaultConfig} vaultConfig
     */
    constructor(maxLtv, dvdInterestRate, doveOracle, auctionConfig, debtConfig, flashMintConfig, offeringConfig, savingsConfig, vaultConfig) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(dvdInterestRate, InterestRate);
            var ptr0 = dvdInterestRate.__destroy_into_raw();
            _assertClass(doveOracle, Oracle);
            var ptr1 = doveOracle.__destroy_into_raw();
            _assertClass(auctionConfig, AuctionConfig);
            var ptr2 = auctionConfig.__destroy_into_raw();
            _assertClass(debtConfig, BookConfig);
            var ptr3 = debtConfig.__destroy_into_raw();
            _assertClass(flashMintConfig, FlashMintConfig);
            var ptr4 = flashMintConfig.__destroy_into_raw();
            _assertClass(offeringConfig, OfferingConfig);
            var ptr5 = offeringConfig.__destroy_into_raw();
            _assertClass(savingsConfig, BookConfig);
            var ptr6 = savingsConfig.__destroy_into_raw();
            _assertClass(vaultConfig, VaultConfig);
            var ptr7 = vaultConfig.__destroy_into_raw();
            wasm.config_new(retptr, maxLtv, ptr0, ptr1, ptr2, ptr3, ptr4, ptr5, ptr6, ptr7);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            ConfigFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {number}
     */
    get maxLtv() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {InterestRate}
     */
    get dvdInterestRate() {
        const ret = wasm.config_dvdInterestRate(this.__wbg_ptr);
        return InterestRate.__wrap(ret);
    }
    /**
     * @returns {Oracle}
     */
    get doveOracle() {
        const ret = wasm.config_doveOracle(this.__wbg_ptr);
        return Oracle.__wrap(ret);
    }
    /**
     * @returns {AuctionConfig}
     */
    get auctionConfig() {
        const ret = wasm.config_auctionConfig(this.__wbg_ptr);
        return AuctionConfig.__wrap(ret);
    }
    /**
     * @returns {BookConfig}
     */
    get debtConfig() {
        const ret = wasm.config_debtConfig(this.__wbg_ptr);
        return BookConfig.__wrap(ret);
    }
    /**
     * @returns {FlashMintConfig}
     */
    get flashMintConfig() {
        const ret = wasm.config_flashMintConfig(this.__wbg_ptr);
        return FlashMintConfig.__wrap(ret);
    }
    /**
     * @returns {OfferingConfig}
     */
    get offeringConfig() {
        const ret = wasm.config_offeringConfig(this.__wbg_ptr);
        return OfferingConfig.__wrap(ret);
    }
    /**
     * @returns {BookConfig}
     */
    get savingsConfig() {
        const ret = wasm.config_savingsConfig(this.__wbg_ptr);
        return BookConfig.__wrap(ret);
    }
    /**
     * @returns {VaultConfig}
     */
    get vaultConfig() {
        const ret = wasm.config_vaultConfig(this.__wbg_ptr);
        return VaultConfig.__wrap(ret);
    }
}

const ConfigUpdateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_configupdate_free(ptr >>> 0, 1));
/**
 * Sets a new config for the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` World account (PDA)
 */
export class ConfigUpdate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConfigUpdateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_configupdate_free(ptr, 0);
    }
    /**
     * @param {Config} new_config
     * @returns {Uint8Array}
     */
    static getData(new_config) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(new_config, Config);
            var ptr0 = new_config.__destroy_into_raw();
            wasm.configupdate_getData(retptr, ptr0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.configupdate_getAccounts(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const DecimalFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_decimal_free(ptr >>> 0, 1));
/**
 * Positive decimal values, precise to 18 digits, with 68 bits of integer precision
 * Maximum value is (2^128 - 1) / 10^18 = 3.4028 * 10^20
 */
export class Decimal {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Decimal.prototype);
        obj.__wbg_ptr = ptr;
        DecimalFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DecimalFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_decimal_free(ptr, 0);
    }
    /**
     * @param {bigint} amount
     * @param {number} decimals
     * @returns {number}
     */
    static tokenAmountToNumber(amount, decimals) {
        const ret = wasm.decimal_tokenAmountToNumber(amount, decimals);
        return ret;
    }
    /**
     * @param {number} amount
     * @param {number} decimals
     * @returns {bigint}
     */
    static numberToTokenAmount(amount, decimals) {
        const ret = wasm.decimal_numberToTokenAmount(amount, decimals);
        return BigInt.asUintN(64, ret);
    }
}

const DvdPriceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_dvdprice_free(ptr >>> 0, 1));
/**
 * Calculates the current price of DVD.
 */
export class DvdPrice {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(DvdPrice.prototype);
        obj.__wbg_ptr = ptr;
        DvdPriceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DvdPriceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dvdprice_free(ptr, 0);
    }
    /**
     * @param {InterestRate} interestRate
     * @param {number} unixTimestamp
     * @returns {Decimal}
     */
    projectPrice(interestRate, unixTimestamp) {
        _assertClass(interestRate, InterestRate);
        const ret = wasm.dvdprice_projectPrice(this.__wbg_ptr, interestRate.__wbg_ptr, unixTimestamp);
        return Decimal.__wrap(ret);
    }
}

const FlashMintFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_flashmint_free(ptr >>> 0, 1));

export class FlashMint {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FlashMint.prototype);
        obj.__wbg_ptr = ptr;
        FlashMintFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FlashMintFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_flashmint_free(ptr, 0);
    }
}

const FlashMintBeginFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_flashmintbegin_free(ptr >>> 0, 1));
/**
 * Executes a flash mint operation
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 * 1. `[writable]` Debt token mint account
 * 2. `[writable]` User's DVD account
 * 3. `[]` Authority account (PDA)
 * 4. `[]` SPL Token program
 * 5. `[]` Instruction sysvar account
 */
export class FlashMintBegin {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FlashMintBeginFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_flashmintbegin_free(ptr, 0);
    }
    /**
     * @param {number} borrowAmount
     * @returns {Uint8Array}
     */
    static getData(borrowAmount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.flashmintbegin_getData(retptr, borrowAmount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.flashmintbegin_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const FlashMintConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_flashmintconfig_free(ptr >>> 0, 1));
/**
 * Configuration for the flash mint system.
 */
export class FlashMintConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(FlashMintConfig.prototype);
        obj.__wbg_ptr = ptr;
        FlashMintConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FlashMintConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_flashmintconfig_free(ptr, 0);
    }
    /**
     * @param {number} fee
     * @param {number} limit
     */
    constructor(fee, limit) {
        const ret = wasm.flashmintconfig_new(fee, limit);
        this.__wbg_ptr = ret >>> 0;
        FlashMintConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    get fee() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get limit() {
        const ret = wasm.auctionconfig_decayRate(this.__wbg_ptr);
        return ret;
    }
}

const FlashMintEndFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_flashmintend_free(ptr >>> 0, 1));
/**
 * Executes the end of a flash mint operation
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` User's DVD account
 * 4. `[]` SPL Token program
 */
export class FlashMintEnd {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        FlashMintEndFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_flashmintend_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.flashmintend_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.flashmintend_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const HashFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hash_free(ptr >>> 0, 1));
/**
 * A hash; the 32-byte output of a hashing algorithm.
 *
 * This struct is used most often in `solana-sdk` and related crates to contain
 * a [SHA-256] hash, but may instead contain a [blake3] hash, as created by the
 * [`blake3`] module (and used in [`Message::hash`]).
 *
 * [SHA-256]: https://en.wikipedia.org/wiki/SHA-2
 * [blake3]: https://github.com/BLAKE3-team/BLAKE3
 * [`blake3`]: crate::blake3
 * [`Message::hash`]: crate::message::Message::hash
 */
export class Hash {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Hash.prototype);
        obj.__wbg_ptr = ptr;
        HashFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HashFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hash_free(ptr, 0);
    }
    /**
     * Create a new Hash object
     *
     * * `value` - optional hash as a base58 encoded string, `Uint8Array`, `[number]`
     * @param {any} value
     */
    constructor(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_constructor(retptr, addHeapObject(value));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            HashFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Return the base58 string representation of the hash
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Checks if two `Hash`s are equal
     * @param {Hash} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, Hash);
        const ret = wasm.hash_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Return the `Uint8Array` representation of the hash
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const InstructionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_instruction_free(ptr >>> 0, 1));
/**
 * wasm-bindgen version of the Instruction struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Instruction struct.
 */
export class Instruction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Instruction.prototype);
        obj.__wbg_ptr = ptr;
        InstructionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InstructionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instruction_free(ptr, 0);
    }
}

const InstructionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_instructions_free(ptr >>> 0, 1));

export class Instructions {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InstructionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_instructions_free(ptr, 0);
    }
    constructor() {
        const ret = wasm.instructions_constructor();
        this.__wbg_ptr = ret >>> 0;
        InstructionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {Instruction} instruction
     */
    push(instruction) {
        _assertClass(instruction, Instruction);
        var ptr0 = instruction.__destroy_into_raw();
        wasm.instructions_push(this.__wbg_ptr, ptr0);
    }
}

const InterestRateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_interestrate_free(ptr >>> 0, 1));
/**
 * A continuously compounding interest rate.
 */
export class InterestRate {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(InterestRate.prototype);
        obj.__wbg_ptr = ptr;
        InterestRateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        InterestRateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_interestrate_free(ptr, 0);
    }
    /**
     * @param {number} apy
     */
    constructor(apy) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.interestrate_new(retptr, apy);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            InterestRateFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {number}
     */
    get apy() {
        const ret = wasm.interestrate_apy(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {InterestRate}
     */
    static get zero() {
        const ret = wasm.interestrate_zero();
        return InterestRate.__wrap(ret);
    }
}

const KeypairFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_keypair_free(ptr >>> 0, 1));
/**
 * A vanilla Ed25519 key pair
 */
export class Keypair {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Keypair.prototype);
        obj.__wbg_ptr = ptr;
        KeypairFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KeypairFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_keypair_free(ptr, 0);
    }
    /**
     * Create a new `Keypair `
     */
    constructor() {
        const ret = wasm.keypair_constructor();
        this.__wbg_ptr = ret >>> 0;
        KeypairFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Convert a `Keypair` to a `Uint8Array`
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.keypair_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Recover a `Keypair` from a `Uint8Array`
     * @param {Uint8Array} bytes
     * @returns {Keypair}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.keypair_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Keypair.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Return the `Pubkey` for this `Keypair`
     * @returns {Pubkey}
     */
    pubkey() {
        const ret = wasm.keypair_pubkey(this.__wbg_ptr);
        return Pubkey.__wrap(ret);
    }
}

const MessageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_message_free(ptr >>> 0, 1));
/**
 * wasm-bindgen version of the Message struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Message struct.
 */
export class Message {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Message.prototype);
        obj.__wbg_ptr = ptr;
        MessageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MessageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr, 0);
    }
    /**
     * The id of a recent ledger entry.
     * @returns {Hash}
     */
    get recent_blockhash() {
        const ret = wasm.__wbg_get_message_recent_blockhash(this.__wbg_ptr);
        return Hash.__wrap(ret);
    }
    /**
     * The id of a recent ledger entry.
     * @param {Hash} arg0
     */
    set recent_blockhash(arg0) {
        _assertClass(arg0, Hash);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_message_recent_blockhash(this.__wbg_ptr, ptr0);
    }
}

const OfferingFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offering_free(ptr >>> 0, 1));

export class Offering {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Offering.prototype);
        obj.__wbg_ptr = ptr;
        OfferingFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfferingFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offering_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get amount() {
        const ret = wasm.offering_amount(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {AuctionConfig} config
     * @param {number} unixTimestamp
     * @returns {number}
     */
    getPrice(config, unixTimestamp) {
        _assertClass(config, AuctionConfig);
        const ret = wasm.offering_getPrice(this.__wbg_ptr, config.__wbg_ptr, unixTimestamp);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get isActive() {
        const ret = wasm.offering_isActive(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} unixTimestamp
     * @returns {bigint}
     */
    getSecsElapsed(unixTimestamp) {
        const ret = wasm.offering_getSecsElapsed(this.__wbg_ptr, unixTimestamp);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {AuctionConfig} config
     * @returns {number}
     */
    getFailPrice(config) {
        _assertClass(config, AuctionConfig);
        const ret = wasm.offering_getFailPrice(this.__wbg_ptr, config.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get isDvd() {
        const ret = wasm.offering_isDvd(this.__wbg_ptr);
        return ret !== 0;
    }
}

const OfferingBuyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offeringbuy_free(ptr >>> 0, 1));
/**
 * Buys from the current world offering
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` User's DVD account
 * 4. `[writable]` Equity token mint account
 * 5. `[writable]` User's DOVE account
 * 6. `[]` Authority account (PDA)
 * 7. `[]` SPL Token program
 */
export class OfferingBuy {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfferingBuyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offeringbuy_free(ptr, 0);
    }
    /**
     * @param {number} requestedBaseAmount
     * @returns {Uint8Array}
     */
    static getData(requestedBaseAmount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.offeringbuy_getData(retptr, requestedBaseAmount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.offeringbuy_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const OfferingConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offeringconfig_free(ptr >>> 0, 1));
/**
 * Configuration for the offering system.
 */
export class OfferingConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(OfferingConfig.prototype);
        obj.__wbg_ptr = ptr;
        OfferingConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfferingConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offeringconfig_free(ptr, 0);
    }
    /**
     * @param {number} surplusLimit
     * @param {number} deficitLimit
     * @param {number} dvdOfferingSize
     * @param {number} doveOfferingSize
     */
    constructor(surplusLimit, deficitLimit, dvdOfferingSize, doveOfferingSize) {
        const ret = wasm.offeringconfig_new(surplusLimit, deficitLimit, dvdOfferingSize, doveOfferingSize);
        this.__wbg_ptr = ret >>> 0;
        OfferingConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {number}
     */
    get surplusLimit() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get deficitLimit() {
        const ret = wasm.auctionconfig_decayRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get dvdOfferingSize() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get doveOfferingSize() {
        const ret = wasm.offeringconfig_doveOfferingSize(this.__wbg_ptr);
        return ret;
    }
}

const OfferingEndFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offeringend_free(ptr >>> 0, 1));
/**
 * Ends the current world offering
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 */
export class OfferingEnd {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfferingEndFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offeringend_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.offeringend_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} program_key
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(program_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program_key, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.offeringend_getAccounts(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const OfferingStartFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offeringstart_free(ptr >>> 0, 1));
/**
 * Starts a world offering if either the deficit or surplus exceeds their limit.
 *
 * Accounts expected:
 *
 * 0. `[writable]` World account (PDA)
 */
export class OfferingStart {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OfferingStartFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offeringstart_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.offeringstart_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} oracleKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, oracleKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(oracleKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.offeringstart_getAccounts(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const OracleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_oracle_free(ptr >>> 0, 1));

export class Oracle {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Oracle.prototype);
        obj.__wbg_ptr = ptr;
        OracleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OracleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_oracle_free(ptr, 0);
    }
    /**
     * @param {OracleKind} kind
     * @param {Uint8Array} key
     */
    constructor(kind, key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(key, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.oracle_new_wasm(retptr, kind, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            OracleFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Uint8Array}
     */
    get key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.oracle_key(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Oracle}
     */
    static zero() {
        const ret = wasm.oracle_zero();
        return Oracle.__wrap(ret);
    }
    /**
     * @param {Uint8Array} oracleKey
     * @param {Uint8Array} oracleData
     * @param {Uint8Array} oracleOwner
     * @param {number} unixTimestamp
     * @returns {number}
     */
    getPriceNegativeIfStale(oracleKey, oracleData, oracleOwner, unixTimestamp) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(oracleKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(oracleData, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(oracleOwner, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.oracle_getPriceNegativeIfStale(retptr, this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, unixTimestamp);
            var r0 = getDataViewMemory0().getFloat64(retptr + 8 * 0, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            return r0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const PageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_page_free(ptr >>> 0, 1));

export class Page {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Page.prototype);
        obj.__wbg_ptr = ptr;
        PageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_page_free(ptr, 0);
    }
    /**
     * @param {Book} book
     * @param {BookConfig} config
     * @param {number} unixTimestamp
     * @returns {number}
     */
    projectTotal(book, config, unixTimestamp) {
        _assertClass(book, Book);
        _assertClass(config, BookConfig);
        const ret = wasm.page_projectTotal(this.__wbg_ptr, book.__wbg_ptr, config.__wbg_ptr, unixTimestamp);
        return ret;
    }
    /**
     * @param {Book} book
     * @param {BookConfig} config
     * @param {number} unixTimestamp
     * @returns {number}
     */
    projectRewards(book, config, unixTimestamp) {
        _assertClass(book, Book);
        _assertClass(config, BookConfig);
        const ret = wasm.page_projectRewards(this.__wbg_ptr, book.__wbg_ptr, config.__wbg_ptr, unixTimestamp);
        return ret;
    }
}

const PubkeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pubkey_free(ptr >>> 0, 1));
/**
 * The address of a [Solana account][acc].
 *
 * Some account addresses are [ed25519] public keys, with corresponding secret
 * keys that are managed off-chain. Often, though, account addresses do not
 * have corresponding secret keys &mdash; as with [_program derived
 * addresses_][pdas] &mdash; or the secret key is not relevant to the operation
 * of a program, and may have even been disposed of. As running Solana programs
 * can not safely create or manage secret keys, the full [`Keypair`] is not
 * defined in `solana-program` but in `solana-sdk`.
 *
 * [acc]: https://solana.com/docs/core/accounts
 * [ed25519]: https://ed25519.cr.yp.to/
 * [pdas]: https://solana.com/docs/core/cpi#program-derived-addresses
 * [`Keypair`]: https://docs.rs/solana-sdk/latest/solana_sdk/signer/keypair/struct.Keypair.html
 */
export class Pubkey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pubkey.prototype);
        obj.__wbg_ptr = ptr;
        PubkeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PubkeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pubkey_free(ptr, 0);
    }
    /**
     * Create a new Pubkey object
     *
     * * `value` - optional public key as a base58 encoded string, `Uint8Array`, `[number]`
     * @param {any} value
     */
    constructor(value) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pubkey_constructor(retptr, addHeapObject(value));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            PubkeyFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Return the base58 string representation of the public key
     * @returns {string}
     */
    toString() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_toString(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export_2(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Check if a `Pubkey` is on the ed25519 curve.
     * @returns {boolean}
     */
    isOnCurve() {
        const ret = wasm.pubkey_isOnCurve(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Checks if two `Pubkey`s are equal
     * @param {Pubkey} other
     * @returns {boolean}
     */
    equals(other) {
        _assertClass(other, Pubkey);
        const ret = wasm.hash_equals(this.__wbg_ptr, other.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Return the `Uint8Array` representation of the public key
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.hash_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Derive a Pubkey from another Pubkey, string seed, and a program id
     * @param {Pubkey} base
     * @param {string} seed
     * @param {Pubkey} owner
     * @returns {Pubkey}
     */
    static createWithSeed(base, seed, owner) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(base, Pubkey);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(owner, Pubkey);
            wasm.pubkey_createWithSeed(retptr, base.__wbg_ptr, ptr0, len0, owner.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Pubkey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Derive a program address from seeds and a program id
     * @param {any[]} seeds
     * @param {Pubkey} program_id
     * @returns {Pubkey}
     */
    static createProgramAddress(seeds, program_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(seeds, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(program_id, Pubkey);
            wasm.pubkey_createProgramAddress(retptr, ptr0, len0, program_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Pubkey.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Find a valid program address
     *
     * Returns:
     * * `[PubKey, number]` - the program address and bump seed
     * @param {any[]} seeds
     * @param {Pubkey} program_id
     * @returns {any}
     */
    static findProgramAddress(seeds, program_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArrayJsValueToWasm0(seeds, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(program_id, Pubkey);
            wasm.pubkey_findProgramAddress(retptr, ptr0, len0, program_id.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ReserveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_reserve_free(ptr >>> 0, 1));

export class Reserve {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Reserve.prototype);
        obj.__wbg_ptr = ptr;
        ReserveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ReserveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_reserve_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get balance() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Uint8Array}
     */
    get mintKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.reserve_mintKey(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const SavingsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savings_free(ptr >>> 0, 1));

export class Savings {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Savings.prototype);
        obj.__wbg_ptr = ptr;
        SavingsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavingsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savings_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @returns {Uint8Array}
     */
    static deriveKey(programKey, userKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.savings_deriveKey(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Savings}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.savings_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Savings.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Page}
     */
    get page() {
        const ret = wasm.savings_page(this.__wbg_ptr);
        return Page.__wrap(ret);
    }
}

const SavingsClaimRewardsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savingsclaimrewards_free(ptr >>> 0, 1));
/**
 * Claims rewards from the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` DOVE mint account
 * 4. `[writable]` DOVE token account (to receive rewards)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class SavingsClaimRewards {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavingsClaimRewardsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savingsclaimrewards_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.savingsclaimrewards_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.savingsclaimrewards_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const SavingsCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savingscreate_free(ptr >>> 0, 1));
/**
 * Creates a new savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA, will be created)
 * 2. `[]` System program
 */
export class SavingsCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavingsCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savingscreate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.savingscreate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.savingscreate_getAccounts(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const SavingsDepositFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savingsdeposit_free(ptr >>> 0, 1));
/**
 * Deposits tokens into the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Debt token mint account
 * 4. `[writable]` Debt token account (to transfer tokens from)
 * 5. `[]` SPL Token program
 */
export class SavingsDeposit {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavingsDepositFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savingsdeposit_free(ptr, 0);
    }
    /**
     * @param {number} amount
     * @returns {Uint8Array}
     */
    static getData(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.savingsdeposit_getData(retptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.savingsdeposit_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const SavingsWithdrawFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_savingswithdraw_free(ptr >>> 0, 1));
/**
 * Withdraws tokens from the savings account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Savings account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Debt token mint account
 * 4. `[writable]` Debt token account (to transfer tokens to)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class SavingsWithdraw {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SavingsWithdrawFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_savingswithdraw_free(ptr, 0);
    }
    /**
     * @param {number} amount
     * @returns {Uint8Array}
     */
    static getData(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.savingswithdraw_getData(retptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.savingsclaimrewards_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const ScheduleFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_schedule_free(ptr >>> 0, 1));

export class Schedule {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Schedule.prototype);
        obj.__wbg_ptr = ptr;
        ScheduleFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ScheduleFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_schedule_free(ptr, 0);
    }
    /**
     * @param {number} maximum
     * @param {number} warmupLength
     * @param {number} totalLength
     */
    constructor(maximum, warmupLength, totalLength) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.schedule_new(retptr, maximum, warmupLength, totalLength);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            ScheduleFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {number}
     */
    get maximum() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get warmupLength() {
        const ret = wasm.auctionconfig_decayRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get totalLength() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} t
     * @returns {number}
     */
    at(t) {
        const ret = wasm.schedule_at(this.__wbg_ptr, t);
        return ret;
    }
    /**
     * @returns {number}
     */
    get totalEmission() {
        const ret = wasm.schedule_totalEmission(this.__wbg_ptr);
        return ret;
    }
}

const SovereignFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sovereign_free(ptr >>> 0, 1));

export class Sovereign {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Sovereign.prototype);
        obj.__wbg_ptr = ptr;
        SovereignFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SovereignFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sovereign_free(ptr, 0);
    }
}

const SovereignUpdateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sovereignupdate_free(ptr >>> 0, 1));
/**
 * Updates the sovereign of the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` Current sovereign account
 * 1. `[]` New sovereign account
 * 2. `[writable]` World account (PDA)
 */
export class SovereignUpdate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SovereignUpdateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sovereignupdate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sovereignupdate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} currentSovereignKey
     * @param {Uint8Array} newSovereignKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, currentSovereignKey, newSovereignKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(currentSovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(newSovereignKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.sovereignupdate_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StabilityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stability_free(ptr >>> 0, 1));
/**
 * A liquidity pool allowing 1:1 swapping between on-demand minted DVD and a
 * blue-chip stablecoin. This helps to stabilize the market price of DVD.
 *
 * To protect against depegs, a `max_deposit` is set by governance: the maximum
 * amount, in USD, that the protocol is willing to lose in the event of a depeg.
 */
export class Stability {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Stability.prototype);
        obj.__wbg_ptr = ptr;
        StabilityFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StabilityFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stability_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} stableMintKey
     * @returns {Uint8Array}
     */
    static deriveKey(programKey, stableMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(stableMintKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.stability_deriveKey(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Stability}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.stability_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Stability.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {number}
     */
    get deposited() {
        const ret = wasm.collateral_maxDeposit(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get maxDeposit() {
        const ret = wasm.collateral_deposited(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Uint8Array}
     */
    get mintKey() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stability_mintKey(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StabilityBuyDvdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stabilitybuydvd_free(ptr >>> 0, 1));
/**
 * Buys DVD from a stability pool
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` User's stable token account (to pay for DVD)
 * 2. `[writable]` User's DVD token account (to receive bought DVD)
 * 3. `[writable]` DVD mint account
 * 4. `[writable]` Stability safe account (to receive stable tokens)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Stability account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 */
export class StabilityBuyDvd {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StabilityBuyDvdFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stabilitybuydvd_free(ptr, 0);
    }
    /**
     * @param {number} amount
     * @returns {Uint8Array}
     */
    static getData(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stabilitybuydvd_getData(retptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} stableMintKey
     * @param {Uint8Array} dvdMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, stableMintKey, dvdMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(stableMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.stabilitybuydvd_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StabilityCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stabilitycreate_free(ptr >>> 0, 1));
/**
 * Creates a new stability pool in the system
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account (paying for account creation)
 * 1. `[writable]` Stability account (PDA, will be created)
 * 2. `[writable]` Safe account (PDA, will be created)
 * 3. `[]` Authority account (PDA)
 * 4. `[]` World account (PDA)
 * 5. `[]` Stable Mint account (for the stable token)
 * 6. `[]` System program
 * 7. `[]` SPL Token program
 */
export class StabilityCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StabilityCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stabilitycreate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stabilitycreate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} stableMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, stableMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(stableMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.stabilitycreate_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StabilitySellDvdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stabilityselldvd_free(ptr >>> 0, 1));
/**
 * Sells DVD to the stability pool in exchange for stable tokens
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (seller)
 * 1. `[writable]` DVD source token account (to sell DVD from)
 * 2. `[writable]` DVD token mint account
 * 3. `[writable]` Safe account (to take stable tokens from)
 * 4. `[writable]` Stable token destination account (to receive stable tokens)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Stability account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 */
export class StabilitySellDvd {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StabilitySellDvdFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stabilityselldvd_free(ptr, 0);
    }
    /**
     * @param {number} amount
     * @returns {Uint8Array}
     */
    static getData(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stabilityselldvd_getData(retptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @param {Uint8Array} stableMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey, stableMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(stableMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.stabilityselldvd_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StabilityUpdateMaxDepositFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stabilityupdatemaxdeposit_free(ptr >>> 0, 1));
/**
 * Updates the maximum deposit for a stability pool
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` Stability account (PDA)
 * 2. `[]` World account (PDA)
 */
export class StabilityUpdateMaxDeposit {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StabilityUpdateMaxDepositFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stabilityupdatemaxdeposit_free(ptr, 0);
    }
    /**
     * @param {number} newMaxDeposit
     * @returns {Uint8Array}
     */
    static getData(newMaxDeposit) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stabilityupdatemaxdeposit_getData(retptr, newMaxDeposit);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} stableMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, stableMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(stableMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.stabilityupdatemaxdeposit_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const StableDvdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_stabledvd_free(ptr >>> 0, 1));
/**
 * The total number of DVD minted with Stability modules.
 * This is just a tracking number, and should be kept in sync with
 * (but does not affect) the actual circulating supply.
 */
export class StableDvd {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(StableDvd.prototype);
        obj.__wbg_ptr = ptr;
        StableDvdFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StableDvdFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stabledvd_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get circulating() {
        const ret = wasm.auctionconfig_beginScale(this.__wbg_ptr);
        return ret;
    }
}

const SystemInstructionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_systeminstruction_free(ptr >>> 0, 1));

export class SystemInstruction {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SystemInstructionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_systeminstruction_free(ptr, 0);
    }
    /**
     * @param {Pubkey} from_pubkey
     * @param {Pubkey} to_pubkey
     * @param {bigint} lamports
     * @param {bigint} space
     * @param {Pubkey} owner
     * @returns {Instruction}
     */
    static createAccount(from_pubkey, to_pubkey, lamports, space, owner) {
        _assertClass(from_pubkey, Pubkey);
        _assertClass(to_pubkey, Pubkey);
        _assertClass(owner, Pubkey);
        const ret = wasm.systeminstruction_createAccount(from_pubkey.__wbg_ptr, to_pubkey.__wbg_ptr, lamports, space, owner.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} from_pubkey
     * @param {Pubkey} to_pubkey
     * @param {Pubkey} base
     * @param {string} seed
     * @param {bigint} lamports
     * @param {bigint} space
     * @param {Pubkey} owner
     * @returns {Instruction}
     */
    static createAccountWithSeed(from_pubkey, to_pubkey, base, seed, lamports, space, owner) {
        _assertClass(from_pubkey, Pubkey);
        _assertClass(to_pubkey, Pubkey);
        _assertClass(base, Pubkey);
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(owner, Pubkey);
        const ret = wasm.systeminstruction_createAccountWithSeed(from_pubkey.__wbg_ptr, to_pubkey.__wbg_ptr, base.__wbg_ptr, ptr0, len0, lamports, space, owner.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} pubkey
     * @param {Pubkey} owner
     * @returns {Instruction}
     */
    static assign(pubkey, owner) {
        _assertClass(pubkey, Pubkey);
        _assertClass(owner, Pubkey);
        const ret = wasm.systeminstruction_assign(pubkey.__wbg_ptr, owner.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} pubkey
     * @param {Pubkey} base
     * @param {string} seed
     * @param {Pubkey} owner
     * @returns {Instruction}
     */
    static assignWithSeed(pubkey, base, seed, owner) {
        _assertClass(pubkey, Pubkey);
        _assertClass(base, Pubkey);
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(owner, Pubkey);
        const ret = wasm.systeminstruction_assignWithSeed(pubkey.__wbg_ptr, base.__wbg_ptr, ptr0, len0, owner.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} from_pubkey
     * @param {Pubkey} to_pubkey
     * @param {bigint} lamports
     * @returns {Instruction}
     */
    static transfer(from_pubkey, to_pubkey, lamports) {
        _assertClass(from_pubkey, Pubkey);
        _assertClass(to_pubkey, Pubkey);
        const ret = wasm.systeminstruction_transfer(from_pubkey.__wbg_ptr, to_pubkey.__wbg_ptr, lamports);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} from_pubkey
     * @param {Pubkey} from_base
     * @param {string} from_seed
     * @param {Pubkey} from_owner
     * @param {Pubkey} to_pubkey
     * @param {bigint} lamports
     * @returns {Instruction}
     */
    static transferWithSeed(from_pubkey, from_base, from_seed, from_owner, to_pubkey, lamports) {
        _assertClass(from_pubkey, Pubkey);
        _assertClass(from_base, Pubkey);
        const ptr0 = passStringToWasm0(from_seed, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(from_owner, Pubkey);
        _assertClass(to_pubkey, Pubkey);
        const ret = wasm.systeminstruction_transferWithSeed(from_pubkey.__wbg_ptr, from_base.__wbg_ptr, ptr0, len0, from_owner.__wbg_ptr, to_pubkey.__wbg_ptr, lamports);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} pubkey
     * @param {bigint} space
     * @returns {Instruction}
     */
    static allocate(pubkey, space) {
        _assertClass(pubkey, Pubkey);
        const ret = wasm.systeminstruction_allocate(pubkey.__wbg_ptr, space);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} address
     * @param {Pubkey} base
     * @param {string} seed
     * @param {bigint} space
     * @param {Pubkey} owner
     * @returns {Instruction}
     */
    static allocateWithSeed(address, base, seed, space, owner) {
        _assertClass(address, Pubkey);
        _assertClass(base, Pubkey);
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(owner, Pubkey);
        const ret = wasm.systeminstruction_allocateWithSeed(address.__wbg_ptr, base.__wbg_ptr, ptr0, len0, space, owner.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} from_pubkey
     * @param {Pubkey} nonce_pubkey
     * @param {Pubkey} authority
     * @param {bigint} lamports
     * @returns {Array<any>}
     */
    static createNonceAccount(from_pubkey, nonce_pubkey, authority, lamports) {
        _assertClass(from_pubkey, Pubkey);
        _assertClass(nonce_pubkey, Pubkey);
        _assertClass(authority, Pubkey);
        const ret = wasm.systeminstruction_createNonceAccount(from_pubkey.__wbg_ptr, nonce_pubkey.__wbg_ptr, authority.__wbg_ptr, lamports);
        return takeObject(ret);
    }
    /**
     * @param {Pubkey} nonce_pubkey
     * @param {Pubkey} authorized_pubkey
     * @returns {Instruction}
     */
    static advanceNonceAccount(nonce_pubkey, authorized_pubkey) {
        _assertClass(nonce_pubkey, Pubkey);
        _assertClass(authorized_pubkey, Pubkey);
        const ret = wasm.systeminstruction_advanceNonceAccount(nonce_pubkey.__wbg_ptr, authorized_pubkey.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} nonce_pubkey
     * @param {Pubkey} authorized_pubkey
     * @param {Pubkey} to_pubkey
     * @param {bigint} lamports
     * @returns {Instruction}
     */
    static withdrawNonceAccount(nonce_pubkey, authorized_pubkey, to_pubkey, lamports) {
        _assertClass(nonce_pubkey, Pubkey);
        _assertClass(authorized_pubkey, Pubkey);
        _assertClass(to_pubkey, Pubkey);
        const ret = wasm.systeminstruction_withdrawNonceAccount(nonce_pubkey.__wbg_ptr, authorized_pubkey.__wbg_ptr, to_pubkey.__wbg_ptr, lamports);
        return Instruction.__wrap(ret);
    }
    /**
     * @param {Pubkey} nonce_pubkey
     * @param {Pubkey} authorized_pubkey
     * @param {Pubkey} new_authority
     * @returns {Instruction}
     */
    static authorizeNonceAccount(nonce_pubkey, authorized_pubkey, new_authority) {
        _assertClass(nonce_pubkey, Pubkey);
        _assertClass(authorized_pubkey, Pubkey);
        _assertClass(new_authority, Pubkey);
        const ret = wasm.systeminstruction_authorizeNonceAccount(nonce_pubkey.__wbg_ptr, authorized_pubkey.__wbg_ptr, new_authority.__wbg_ptr);
        return Instruction.__wrap(ret);
    }
}

const TokenFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_token_free(ptr >>> 0, 1));
/**
 * A token controlled by the Authority.
 */
export class Token {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Token.prototype);
        obj.__wbg_ptr = ptr;
        TokenFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TokenFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_token_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get supply() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get decimals() {
        const ret = wasm.token_decimals(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Uint8Array}
     */
    get mint() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.token_mint(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const TransactionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transaction_free(ptr >>> 0, 1));
/**
 * wasm-bindgen version of the Transaction struct.
 * This duplication is required until https://github.com/rustwasm/wasm-bindgen/issues/3671
 * is fixed. This must not diverge from the regular non-wasm Transaction struct.
 */
export class Transaction {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Transaction.prototype);
        obj.__wbg_ptr = ptr;
        TransactionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransactionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr, 0);
    }
    /**
     * Create a new `Transaction`
     * @param {Instructions} instructions
     * @param {Pubkey | undefined} [payer]
     */
    constructor(instructions, payer) {
        _assertClass(instructions, Instructions);
        var ptr0 = instructions.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(payer)) {
            _assertClass(payer, Pubkey);
            ptr1 = payer.__destroy_into_raw();
        }
        const ret = wasm.transaction_constructor(ptr0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        TransactionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Return a message containing all data that should be signed.
     * @returns {Message}
     */
    message() {
        const ret = wasm.transaction_message(this.__wbg_ptr);
        return Message.__wrap(ret);
    }
    /**
     * Return the serialized message data to sign.
     * @returns {Uint8Array}
     */
    messageData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_messageData(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Verify the transaction
     */
    verify() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_verify(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Keypair} keypair
     * @param {Hash} recent_blockhash
     */
    partialSign(keypair, recent_blockhash) {
        _assertClass(keypair, Keypair);
        _assertClass(recent_blockhash, Hash);
        wasm.transaction_partialSign(this.__wbg_ptr, keypair.__wbg_ptr, recent_blockhash.__wbg_ptr);
    }
    /**
     * @returns {boolean}
     */
    isSigned() {
        const ret = wasm.transaction_isSigned(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_toBytes(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Transaction}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.transaction_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Transaction.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const UserFeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userfeed_free(ptr >>> 0, 1));
/**
 * A user-controlled oracle, for testing and initial implementation.
 */
export class UserFeed {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserFeedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userfeed_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} program_key
     * @param {Uint8Array} user_key
     * @param {number} index
     * @returns {Uint8Array}
     */
    static derive_key(program_key, user_key, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program_key, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(user_key, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.userfeed_derive_key(retptr, ptr0, len0, ptr1, len1, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const UserFeedCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userfeedcreate_free(ptr >>> 0, 1));
/**
 * Creates a new user feed account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` UserFeed account (PDA, will be created)
 * 2. `[]` System program
 */
export class UserFeedCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserFeedCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userfeedcreate_free(ptr, 0);
    }
    /**
     * @param {number} index
     * @returns {Uint8Array}
     */
    static getData(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.userfeedcreate_getData(retptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {number} index
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.userfeedcreate_getAccounts(retptr, ptr0, len0, ptr1, len1, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const UserFeedSetPriceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_userfeedsetprice_free(ptr >>> 0, 1));
/**
 * Sets the price for a user feed
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (owner of the UserFeed)
 * 1. `[writable]` UserFeed account (PDA)
 */
export class UserFeedSetPrice {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        UserFeedSetPriceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userfeedsetprice_free(ptr, 0);
    }
    /**
     * @param {number} price
     * @returns {Uint8Array}
     */
    static getData(price) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.userfeedsetprice_getData(retptr, price);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {number} index
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.userfeedsetprice_getAccounts(retptr, ptr0, len0, ptr1, len1, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vault_free(ptr >>> 0, 1));

export class Vault {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Vault.prototype);
        obj.__wbg_ptr = ptr;
        VaultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vault_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @returns {Uint8Array}
     */
    static deriveKey(programKey, userKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.vault_deriveKey(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {Vault}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.vault_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return Vault.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {(Reserve)[]}
     */
    get reserves() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vault_reserves(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Page}
     */
    get debt() {
        const ret = wasm.vault_debt(this.__wbg_ptr);
        return Page.__wrap(ret);
    }
    /**
     * @returns {boolean}
     */
    get isDebtZero() {
        const ret = wasm.vault_isDebtZero(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    get isLiquidated() {
        const ret = wasm.vault_isLiquidated(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} index
     * @param {number} unixTimestamp
     * @param {AuctionConfig} config
     * @returns {number | undefined}
     */
    calculateAuctionPrice(index, unixTimestamp, config) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(config, AuctionConfig);
            wasm.vault_calculateAuctionPrice(retptr, this.__wbg_ptr, index, unixTimestamp, config.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unixTimestamp
     * @returns {number | undefined}
     */
    getAuctionSecsElapsed(unixTimestamp) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vault_getAuctionSecsElapsed(retptr, this.__wbg_ptr, unixTimestamp);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {number} unixTimestamp
     * @param {AuctionConfig} config
     * @returns {boolean | undefined}
     */
    isAuctionOver(unixTimestamp, config) {
        _assertClass(config, AuctionConfig);
        const ret = wasm.vault_isAuctionOver(this.__wbg_ptr, unixTimestamp, config.__wbg_ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
     * @param {AuctionConfig} config
     * @param {number} index
     * @returns {number | undefined}
     */
    getAuctionFailPrice(config, index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(config, AuctionConfig);
            wasm.vault_getAuctionFailPrice(retptr, this.__wbg_ptr, config.__wbg_ptr, index);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r2 = getDataViewMemory0().getFloat64(retptr + 8 * 1, true);
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultBorrowFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultborrow_free(ptr >>> 0, 1));
/**
 * Borrows tokens from the world
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Mint account (for the DVD)
 * 2. `[writable]` Debt token account (to receive borrowed tokens)
 * 3. `[writable]` World account (PDA)
 * 4. `[writable]` Vault account (PDA)
 * 5. `[]` Authority account (PDA)
 * 6. `[]` SPL Token program
 * 7..n. `[]` Collateral accounts in order of vault reserves (PDAs)
 * n..m. `[]` Oracle accounts in order of vault reserves (PDAs)
 */
export class VaultBorrow {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultBorrowFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultborrow_free(ptr, 0);
    }
    /**
     * @param {number} requestedAmount
     * @returns {Uint8Array}
     */
    static getData(requestedAmount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultborrow_getData(retptr, requestedAmount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @param {any[]} collateralMintKeys
     * @param {any[]} oracleKeys
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey, collateralMintKeys, oracleKeys) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArrayJsValueToWasm0(collateralMintKeys, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passArrayJsValueToWasm0(oracleKeys, wasm.__wbindgen_export_0);
            const len4 = WASM_VECTOR_LEN;
            wasm.vaultborrow_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v6 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v6;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultBuyCollateralFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultbuycollateral_free(ptr >>> 0, 1));
/**
 * Buys collateral from a liquidated vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account (buyer)
 * 1. `[writable]` DVD token account (to pay for collateral)
 * 2. `[writable]` DVD token mint account
 * 3. `[writable]` Safe account (to take bought collateral from)
 * 4. `[writable]` Collateral destination token account (to receive bought collateral)
 * 5. `[writable]` World account (PDA)
 * 6. `[writable]` Vault account (PDA)
 * 7. `[]` Authority account (PDA)
 * 8. `[]` SPL Token program
 * 9. `[writable]` Collateral account (PDA)
 */
export class VaultBuyCollateral {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultBuyCollateralFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultbuycollateral_free(ptr, 0);
    }
    /**
     * @param {number} requestedDvdAmount
     * @param {number} collateralIndex
     * @returns {Uint8Array}
     */
    static getData(requestedDvdAmount, collateralIndex) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultbuycollateral_getData(retptr, requestedDvdAmount, collateralIndex);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} vaultKey
     * @param {Uint8Array} dvdMintKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, vaultKey, dvdMintKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(vaultKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len4 = WASM_VECTOR_LEN;
            wasm.vaultbuycollateral_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v6 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v6;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultClaimRewardsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultclaimrewards_free(ptr >>> 0, 1));
/**
 * Claims rewards from the vault account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` DOVE mint account
 * 4. `[writable]` DOVE token account (to receive rewards)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 */
export class VaultClaimRewards {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultClaimRewardsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultclaimrewards_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultclaimrewards_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vaultclaimrewards_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultConfigFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultconfig_free(ptr >>> 0, 1));

export class VaultConfig {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(VaultConfig.prototype);
        obj.__wbg_ptr = ptr;
        VaultConfigFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultConfigFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultconfig_free(ptr, 0);
    }
    /**
     * @param {number} liquidationPenaltyRate
     * @param {number} liquidationRewardCap
     * @param {number} liquidationRewardRate
     * @param {number} auctionFailureRewardCap
     * @param {number} auctionFailureRewardRate
     */
    constructor(liquidationPenaltyRate, liquidationRewardCap, liquidationRewardRate, auctionFailureRewardCap, auctionFailureRewardRate) {
        const ret = wasm.vaultconfig_new(liquidationPenaltyRate, liquidationRewardCap, liquidationRewardRate, auctionFailureRewardCap, auctionFailureRewardRate);
        this.__wbg_ptr = ret >>> 0;
        VaultConfigFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {VaultConfig}
     */
    static zero() {
        const ret = wasm.vaultconfig_zero();
        return VaultConfig.__wrap(ret);
    }
    /**
     * @returns {number}
     */
    get liquidationRewardCap() {
        const ret = wasm.auctionconfig_decayRate(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get liquidationRewardRate() {
        const ret = wasm.auctionconfig_endScale(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get auctionFailureRewardCap() {
        const ret = wasm.offeringconfig_doveOfferingSize(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get auctionFailureRewardRate() {
        const ret = wasm.vaultconfig_auctionFailureRewardRate(this.__wbg_ptr);
        return ret;
    }
}

const VaultCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultcreate_free(ptr >>> 0, 1));
/**
 * Creates a new vault account
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA, will be created)
 * 2. `[]` System program
 */
export class VaultCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultcreate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultcreate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            wasm.vaultcreate_getAccounts(retptr, ptr0, len0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultCreateReserveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultcreatereserve_free(ptr >>> 0, 1));
/**
 * Creates a new reserve in a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` Collateral account (PDA)
 */
export class VaultCreateReserve {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultCreateReserveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultcreatereserve_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultcreatereserve_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vaultcreatereserve_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultDepositFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultdeposit_free(ptr >>> 0, 1));
/**
 * Deposits tokens into a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` Collateral account (PDA)
 * 3. `[writable]` User's token account (source of tokens)
 * 4. `[writable]` Collateral's token account (destination for tokens)
 * 5. `[]` SPL Token program
 */
export class VaultDeposit {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultDepositFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultdeposit_free(ptr, 0);
    }
    /**
     * @param {number} amount
     * @returns {Uint8Array}
     */
    static getData(amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultdeposit_getData(retptr, amount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vaultdeposit_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultFailAuctionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultfailauction_free(ptr >>> 0, 1));
/**
 * Fails the auction for a liquidated vault
 *
 * Accounts expected:
 * 0. `[writable]` Vault account (PDA) for which to fail the auction
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` Debt token mint account
 * 3. `[writable]` Debt token account (to receive auction failure reward)
 * 4. `[]` Authority account (PDA)
 * 5. `[]` SPL Token program
 */
export class VaultFailAuction {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultFailAuctionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultfailauction_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultfailauction_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} vaultKey
     * @param {Uint8Array} dvdMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, vaultKey, dvdMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(vaultKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.vaultfailauction_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultLiquidateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultliquidate_free(ptr >>> 0, 1));
/**
 * Liquidates a vault
 *
 * Accounts expected:
 *
 * 0. `[writable]` Debt token mint account
 * 1. `[writable]` Debt token account (to receive liquidation reward)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` Vault account (PDA) to be liquidated
 * 4. `[]` Authority account (PDA)
 * 5. `[]` SPL Token program
 * 6..n. `[]` Collateral accounts in order of vault reserves (PDAs)
 * n..m. `[]` Oracle accounts in order of vault reserves (PDAs)
 */
export class VaultLiquidate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultLiquidateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultliquidate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultliquidate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} vaultKey
     * @param {Uint8Array} dvdMintKey
     * @param {any[]} collateralMintKeys
     * @param {any[]} oracleKeys
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, vaultKey, dvdMintKey, collateralMintKeys, oracleKeys) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(vaultKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            const ptr4 = passArrayJsValueToWasm0(collateralMintKeys, wasm.__wbindgen_export_0);
            const len4 = WASM_VECTOR_LEN;
            const ptr5 = passArrayJsValueToWasm0(oracleKeys, wasm.__wbindgen_export_0);
            const len5 = WASM_VECTOR_LEN;
            wasm.vaultliquidate_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v7 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v7;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultRemoveReserveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultremovereserve_free(ptr >>> 0, 1));
/**
 * Removes a reserve from a vault
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[]` Collateral mint account
 */
export class VaultRemoveReserve {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultRemoveReserveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultremovereserve_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultremovereserve_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} collateralMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, collateralMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(collateralMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vaultremovereserve_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultRepayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultrepay_free(ptr >>> 0, 1));
/**
 * Repays borrowed DVD to the vault
 *
 * Accounts expected:
 * 0. `[signer]` User account
 * 1. `[writable]` Debt token account (must be owned by user)
 * 2. `[writable]` Mint account (for the DVD)
 * 3. `[writable]` World account (PDA)
 * 4. `[writable]` Vault account (PDA)
 * 5. `[]` SPL Token program
 */
export class VaultRepay {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultRepayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultrepay_free(ptr, 0);
    }
    /**
     * @param {number} requestedAmount
     * @returns {Uint8Array}
     */
    static getData(requestedAmount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultrepay_getData(retptr, requestedAmount);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} dvdMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, dvdMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vaultrepay_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultUnliquidateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultunliquidate_free(ptr >>> 0, 1));
/**
 * Unliquidates a vault
 *
 * Accounts expected:
 * 0. `[writable]` Vault account (PDA) to be unliquidated
 */
export class VaultUnliquidate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultUnliquidateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultunliquidate_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultunliquidate_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} vaultKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(vaultKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(vaultKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.vaultunliquidate_getAccounts(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VaultWithdrawFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vaultwithdraw_free(ptr >>> 0, 1));
/**
 * Withdraws tokens from a vault
 *
 * Accounts expected:
 * 0. `[signer]` User account
 * 1. `[writable]` Vault account (PDA)
 * 2. `[writable]` World account (PDA)
 * 3. `[writable]` User's token account (destination for tokens)
 * 4. `[writable]` Safe account (source of tokens)
 * 5. `[]` SPL Token program
 * 6. `[]` Authority account (PDA)
 * 7..n. `[writable]` Collateral accounts for reserves in the vault, in order (PDAs)
 * n..m. `[]` Oracle accounts for reserves in the vault, in order
 */
export class VaultWithdraw {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VaultWithdrawFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vaultwithdraw_free(ptr, 0);
    }
    /**
     * @param {number} requestedAmount
     * @param {number} reserveIndex
     * @returns {Uint8Array}
     */
    static getData(requestedAmount, reserveIndex) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vaultwithdraw_getData(retptr, requestedAmount, reserveIndex);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {any[]} collateralMintKeys
     * @param {any[]} oracleKeys
     * @param {number} reserveIndex
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, collateralMintKeys, oracleKeys, reserveIndex) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArrayJsValueToWasm0(collateralMintKeys, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArrayJsValueToWasm0(oracleKeys, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.vaultwithdraw_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, reserveIndex);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VestingFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vesting_free(ptr >>> 0, 1));

export class Vesting {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Vesting.prototype);
        obj.__wbg_ptr = ptr;
        VestingFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VestingFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vesting_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get recipient() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vesting_recipient(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {Schedule}
     */
    get schedule() {
        const ret = wasm.vesting_schedule(this.__wbg_ptr);
        return Schedule.__wrap(ret);
    }
    /**
     * @param {number} unixTimestamp
     * @returns {number}
     */
    getEmissionDue(unixTimestamp) {
        const ret = wasm.vesting_getEmissionDue(this.__wbg_ptr, unixTimestamp);
        return ret;
    }
    /**
     * @returns {number}
     */
    get creationTime() {
        const ret = wasm.vesting_creationTime(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get distributed() {
        const ret = wasm.vesting_distributed(this.__wbg_ptr);
        return ret;
    }
}

const VestingClaimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vestingclaim_free(ptr >>> 0, 1));
/**
 * Claims vesting rewards
 *
 * Accounts expected:
 *
 * 0. `[signer]` User account
 * 1. `[writable]` World account (PDA)
 * 2. `[writable]` DOVE mint account
 * 3. `[writable]` DOVE token account (to receive rewards)
 * 4. `[]` SPL Token program
 * 5. `[]` Authority account (PDA)
 */
export class VestingClaim {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VestingClaimFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vestingclaim_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vestingclaim_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} userKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, userKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(userKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vestingclaim_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const VestingUpdateRecipientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vestingupdaterecipient_free(ptr >>> 0, 1));
/**
 * Updates the recipient of a vesting account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Current recipient account
 * 1. `[writable]` World account (PDA)
 * 2. `[]` New recipient account
 */
export class VestingUpdateRecipient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VestingUpdateRecipientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vestingupdaterecipient_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    static getData() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vestingupdaterecipient_getData(retptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} currentRecipientKey
     * @param {Uint8Array} newRecipientKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, currentRecipientKey, newRecipientKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(currentRecipientKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(newRecipientKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            wasm.vestingupdaterecipient_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v4 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v4;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

const WorldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_world_free(ptr >>> 0, 1));
/**
 * The struct containing all global state.
 *
 * **Safety**: Never overwrite the fields of this struct directly (/world\.(.+) = /).
 * Doing so is unsafe and violates critical invariants.
 * Always use the associated functions on the state objects to modify state.
 */
export class World {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(World.prototype);
        obj.__wbg_ptr = ptr;
        WorldFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WorldFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_world_free(ptr, 0);
    }
    /**
     * @returns {Token}
     */
    get dove() {
        const ret = wasm.__wbg_get_world_dove(this.__wbg_ptr);
        return Token.__wrap(ret);
    }
    /**
     * @param {Token} arg0
     */
    set dove(arg0) {
        _assertClass(arg0, Token);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_dove(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Token}
     */
    get dvd() {
        const ret = wasm.__wbg_get_world_dvd(this.__wbg_ptr);
        return Token.__wrap(ret);
    }
    /**
     * @param {Token} arg0
     */
    set dvd(arg0) {
        _assertClass(arg0, Token);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_dvd(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Book}
     */
    get debt() {
        const ret = wasm.__wbg_get_world_debt(this.__wbg_ptr);
        return Book.__wrap(ret);
    }
    /**
     * @param {Book} arg0
     */
    set debt(arg0) {
        _assertClass(arg0, Book);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_debt(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Book}
     */
    get savings() {
        const ret = wasm.__wbg_get_world_savings(this.__wbg_ptr);
        return Book.__wrap(ret);
    }
    /**
     * @param {Book} arg0
     */
    set savings(arg0) {
        _assertClass(arg0, Book);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_savings(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {StableDvd}
     */
    get stable_dvd() {
        const ret = wasm.__wbg_get_world_stable_dvd(this.__wbg_ptr);
        return StableDvd.__wrap(ret);
    }
    /**
     * @param {StableDvd} arg0
     */
    set stable_dvd(arg0) {
        _assertClass(arg0, StableDvd);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_stable_dvd(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {DvdPrice}
     */
    get dvd_price() {
        const ret = wasm.__wbg_get_world_dvd_price(this.__wbg_ptr);
        return DvdPrice.__wrap(ret);
    }
    /**
     * @param {DvdPrice} arg0
     */
    set dvd_price(arg0) {
        _assertClass(arg0, DvdPrice);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_dvd_price(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Offering}
     */
    get offering() {
        const ret = wasm.__wbg_get_world_offering(this.__wbg_ptr);
        return Offering.__wrap(ret);
    }
    /**
     * @param {Offering} arg0
     */
    set offering(arg0) {
        _assertClass(arg0, Offering);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_offering(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {FlashMint}
     */
    get flash_mint() {
        const ret = wasm.__wbg_get_world_flash_mint(this.__wbg_ptr);
        return FlashMint.__wrap(ret);
    }
    /**
     * @param {FlashMint} arg0
     */
    set flash_mint(arg0) {
        _assertClass(arg0, FlashMint);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_flash_mint(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Sovereign}
     */
    get sovereign() {
        const ret = wasm.__wbg_get_world_sovereign(this.__wbg_ptr);
        return Sovereign.__wrap(ret);
    }
    /**
     * @param {Sovereign} arg0
     */
    set sovereign(arg0) {
        _assertClass(arg0, Sovereign);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_sovereign(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Vesting}
     */
    get vesting() {
        const ret = wasm.__wbg_get_world_vesting(this.__wbg_ptr);
        return Vesting.__wrap(ret);
    }
    /**
     * @param {Vesting} arg0
     */
    set vesting(arg0) {
        _assertClass(arg0, Vesting);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_vesting(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {Config}
     */
    get config() {
        const ret = wasm.__wbg_get_world_config(this.__wbg_ptr);
        return Config.__wrap(ret);
    }
    /**
     * @param {Config} arg0
     */
    set config(arg0) {
        _assertClass(arg0, Config);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_world_config(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Uint8Array} program_key
     * @returns {Uint8Array}
     */
    static deriveKey(program_key) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(program_key, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.world_deriveKey(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v2 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {World}
     */
    static fromBytes(bytes) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            wasm.world_fromBytes(retptr, ptr0, len0);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return World.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @returns {World}
     */
    static zero() {
        const ret = wasm.world_zero();
        return World.__wrap(ret);
    }
    /**
     * @returns {DvdPrice}
     */
    get dvdPrice() {
        const ret = wasm.world_dvdPrice(this.__wbg_ptr);
        return DvdPrice.__wrap(ret);
    }
    /**
     * @returns {StableDvd}
     */
    get stableDvd() {
        const ret = wasm.world_stableDvd(this.__wbg_ptr);
        return StableDvd.__wrap(ret);
    }
    /**
     * @returns {FlashMint}
     */
    get flashMint() {
        const ret = wasm.world_flashMint(this.__wbg_ptr);
        return FlashMint.__wrap(ret);
    }
}

const WorldCreateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_worldcreate_free(ptr >>> 0, 1));
/**
 * Creates the program's world account
 *
 * Accounts expected:
 *
 * 0. `[signer]` Sovereign account
 * 1. `[writable]` World account (PDA, will be created)
 * 2. `[]` Authority account (PDA)
 * 3. `[]` Mint account for the DVD
 * 4. `[]` Mint account for the DOVE
 * 5. `[]` System program
 */
export class WorldCreate {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WorldCreateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_worldcreate_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} vestingRecipient
     * @param {Schedule} vestingSchedule
     * @returns {Uint8Array}
     */
    static getData(vestingRecipient, vestingSchedule) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(vestingRecipient, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            _assertClass(vestingSchedule, Schedule);
            var ptr1 = vestingSchedule.__destroy_into_raw();
            wasm.worldcreate_getData(retptr, ptr0, len0, ptr1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v3 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 1, 1);
            return v3;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * @param {Uint8Array} programKey
     * @param {Uint8Array} sovereignKey
     * @param {Uint8Array} dvdMintKey
     * @param {Uint8Array} doveMintKey
     * @returns {(AccountWasm)[]}
     */
    static getAccounts(programKey, sovereignKey, dvdMintKey, doveMintKey) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(programKey, wasm.__wbindgen_export_0);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passArray8ToWasm0(sovereignKey, wasm.__wbindgen_export_0);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(dvdMintKey, wasm.__wbindgen_export_0);
            const len2 = WASM_VECTOR_LEN;
            const ptr3 = passArray8ToWasm0(doveMintKey, wasm.__wbindgen_export_0);
            const len3 = WASM_VECTOR_LEN;
            wasm.worldcreate_getAccounts(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
            if (r3) {
                throw takeObject(r2);
            }
            var v5 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_export_2(r0, r1 * 4, 4);
            return v5;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg_reserve_new = function(arg0) {
        const ret = Reserve.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_accountwasm_new = function(arg0) {
        const ret = AccountWasm.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_instruction_new = function(arg0) {
        const ret = Instruction.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_pubkey_new = function(arg0) {
        const ret = Pubkey.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_debug_69675dd374e2c249 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_53abcd6a461f73d8 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_f073b719c8035bbf = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_f740dc2253ea759b = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_41503a1c2194de89 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export_2(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_call_a9ef466721e824f2 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_5419cf6b954aa11d = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_f217bbbf7e8e4df4 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_034f913e7636e987 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_next_13b477da1eaa3897 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_b06e115d1b01e10b = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_983b5ffcaec8c583 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_2ab8a198c834c26a = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_695d699a44d6234c = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_ef828680c64da212 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithlength_310c7b54443dbe66 = function(arg0) {
        const ret = new Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_425e70f7c64ac962 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_isArray_6f3b47f09adb61b5 = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_push_36cf4d81d7da33d1 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_74945570b4a62ec7 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_values_6373aaca055b168e = function(arg0) {
        const ret = getObject(arg0).values();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_b9dff570f01a9100 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_buffer_ccaed51a635d8a2d = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_fec2611eb9180f95 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_ec2fcf81bc573fd9 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_9254c4bd3b9f23c4 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_df0761410414ef36 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_76462a666eca145f = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_975a06f9dbd16995 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_MODULE_ef3aa2eb251158a5 = function() {
        const ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_7eede1f4488bf346 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_c909fb428dcbddb6 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_511eefefbfc70ae4 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_900d5c3984fe7703 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_307049345d0bd88c = function(arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_cd175915511f705e = function(arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    };
    imports.wbg.__wbg_randomFillSync_85b3f4c52c56c313 = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('dove_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
