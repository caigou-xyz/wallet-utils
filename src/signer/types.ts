import { bitcoin } from '../bitcoin-core';
import { NetworkType } from '../network';

/**
 * 签名选项接口
 */
export interface SignOptions {
  autoFinalized?: boolean;
  [key: string]: any;
}

/**
 * PSBT签名选项，兼容Unisat
 */
export interface PsbtSignOptions {
  autoFinalized?: boolean;
  toSignInputs?: Array<{
    index: number;
    address?: string;
    publicKey?: string;
    sighashTypes?: number[];
    useTweakedSigner?: boolean;
    disableTweakSigner?: boolean;
    tapLeafHashToSign?: Uint8Array;
  }>;
}

/**
 * 消息签名类型
 */
export type MessageSignType = 'bip322-simple' | 'ecdsa';

/**
 * 签名器基础接口
 */
export interface ISigner {
  /**
   * 获取地址
   */
  getAddress(): string;

  /**
   * 获取公钥
   */
  getPublicKey(): string;

  /**
   * 获取网络类型
   */
  getNetworkType(): NetworkType;

  /**
   * 签名消息
   * @param message 要签名的消息
   * @param type 签名类型
   */
  signMessage(message: string, type?: MessageSignType): Promise<string>;

  /**
   * 签名PSBT
   * @param psbt PSBT字符串或对象
   * @param options 签名选项
   */
  signPsbt(psbt: string | bitcoin.Psbt, options?: PsbtSignOptions): Promise<bitcoin.Psbt>;

  /**
   * 批量签名PSBTs
   * @param psbts PSBT数组
   * @param options 签名选项
   */
  signPsbts(psbts: Array<string | bitcoin.Psbt>, options?: PsbtSignOptions): Promise<bitcoin.Psbt[]>;
}

/**
 * 钱包初始化选项
 */
export interface WalletInitOptions {
  networkType?: NetworkType;
  hdPath?: string;
  passphrase?: string;
}

/**
 * 从私钥创建钱包的选项
 */
export interface FromPrivateKeyOptions extends WalletInitOptions {
  privateKey: string;
}

/**
 * 从助记词创建钱包的选项
 */
export interface FromMnemonicOptions extends WalletInitOptions {
  mnemonic: string;
  accountIndex?: number;
}

/**
 * 签名器工厂接口
 */
export interface ISignerFactory<T extends ISigner = ISigner> {
  /**
   * 从随机生成创建签名器
   */
  fromRandom(options?: WalletInitOptions): T;

  /**
   * 从私钥创建签名器
   */
  fromPrivateKey(options: FromPrivateKeyOptions): T;

  /**
   * 从助记词创建签名器
   */
  fromMnemonic(options: FromMnemonicOptions): T;
}
