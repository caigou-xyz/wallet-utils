import { bitcoin } from '../bitcoin-core';
import { NetworkType } from '../network';
import { ISigner, MessageSignType, PsbtSignOptions } from './types';

/**
 * UniSat 网络类型映射
 */
const UNISAT_NETWORKS = {
  [NetworkType.MAINNET]: 'livenet',
  [NetworkType.TESTNET]: 'testnet',
  [NetworkType.REGTEST]: 'regtest'
} as const;

/**
 * UniSat 错误类型
 */
export class UniSatError extends Error {
  constructor(
    message: string,
    public code?: number
  ) {
    super(message);
    this.name = 'UniSatError';
  }
}

/**
 * UniSat Signer 类
 * 专门用于签名相关功能
 */
export class UniSatSigner implements ISigner {
  private unisat: any;

  constructor() {
    // 检查 UniSat 钱包是否可用
    if (typeof window === 'undefined' || !window.unisat) {
      throw new UniSatError('UniSat 钱包未找到，请确保已安装 UniSat 浏览器扩展');
    }
    this.unisat = window.unisat;
  }

  /**
   * 获取地址
   */
  getAddress(): string {
    throw new Error('请使用 getAccounts() 方法获取地址');
  }

  /**
   * 获取公钥
   */
  getPublicKey(): string {
    throw new Error('请使用异步方法获取公钥');
  }

  /**
   * 获取网络类型
   */
  getNetworkType(): NetworkType {
    throw new Error('请使用异步方法获取网络类型');
  }

  /**
   * 获取账户列表，如果未连接会直接报错
   */
  async getAccounts(): Promise<string[]> {
    try {
      const accounts = await this.unisat.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new UniSatError('账户未连接');
      }
      return accounts;
    } catch (error: any) {
      throw new UniSatError(`获取账户失败: ${error.message}`, error.code);
    }
  }

  /**
   * 签名消息
   */
  async signMessage(message: string, type: MessageSignType = 'ecdsa'): Promise<string> {
    try {
      return await this.unisat.signMessage(message, type);
    } catch (error: any) {
      throw new UniSatError(`签名消息失败: ${error.message}`, error.code);
    }
  }

    /**
   * 签名 PSBT
   */
  async signPsbt(psbt: string | bitcoin.Psbt, options?: PsbtSignOptions): Promise<bitcoin.Psbt> {
    try {
      let psbtHex: string;
      if (typeof psbt === 'string') {
        psbtHex = psbt;
      } else {
        psbtHex = psbt.toHex();
      }

      const signedPsbtHex = await this.unisat.signPsbt(psbtHex, options);
      
      // 获取当前网络并转换回对象
      const unisatNetwork = await this.unisat.getNetwork();
      const network = unisatNetwork === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
      
      return bitcoin.Psbt.fromHex(signedPsbtHex, { network });
    } catch (error: any) {
      throw new UniSatError(`签名 PSBT 失败: ${error.message}`, error.code);
    }
  }

  /**
   * 批量签名 PSBTs
   */
  async signPsbts(psbts: Array<string | bitcoin.Psbt>, options?: PsbtSignOptions): Promise<bitcoin.Psbt[]> {
    try {
      // 转换为十六进制字符串数组
      const psbtHexs = psbts.map((psbt) => (typeof psbt === 'string' ? psbt : psbt.toHex()));

      const signedPsbtHexs = await this.unisat.signPsbts(psbtHexs, options);
      
      // 获取当前网络并转换回对象数组
      const unisatNetwork = await this.unisat.getNetwork();
      const network = unisatNetwork === 'livenet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
      
      return signedPsbtHexs.map((hex: string) => bitcoin.Psbt.fromHex(hex, { network }));
    } catch (error: any) {
      throw new UniSatError(`批量签名 PSBT 失败: ${error.message}`, error.code);
    }
  }

  /**
   * 检查 UniSat 钱包是否可用
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.unisat;
  }
}

// 扩展 window 类型定义
declare global {
  interface Window {
    unisat?: any;
  }
}

