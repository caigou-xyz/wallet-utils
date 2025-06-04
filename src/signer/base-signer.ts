import { bitcoin } from '../bitcoin-core';
import { NetworkType, toPsbtNetwork } from '../network';
import { AddressType, SignPsbtOptions } from '../types';
import { LocalWallet } from '../wallet/local-wallet';
import { ISigner, MessageSignType, PsbtSignOptions } from './types';

/**
 * 基础签名器抽象类
 * 提供通用的签名逻辑实现
 */
export abstract class BaseSigner implements ISigner {
  protected wallet: LocalWallet;

  constructor(wallet: LocalWallet) {
    this.wallet = wallet;
  }

  /**
   * 获取地址
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * 获取公钥
   */
  getPublicKey(): string {
    return this.wallet.pubkey;
  }

  /**
   * 获取网络类型
   */
  getNetworkType(): NetworkType {
    return this.wallet.networkType;
  }

  /**
   * 获取地址类型
   */
  protected getAddressType(): AddressType {
    return this.wallet.addressType;
  }

  /**
   * 签名消息
   * @param message 要签名的消息
   * @param type 签名类型，默认为ecdsa（符合UniSat官方规范）
   */
  async signMessage(message: string, type: MessageSignType = 'ecdsa'): Promise<string> {
    return await this.wallet.signMessage(message, type);
  }

  /**
   * 签名PSBT
   * @param psbt PSBT字符串或对象
   * @param options 签名选项
   */
  async signPsbt(psbt: string | bitcoin.Psbt, options?: PsbtSignOptions): Promise<bitcoin.Psbt> {
    // 转换Unisat格式的选项到内部格式
    const signOptions: SignPsbtOptions = this.convertPsbtSignOptions(options);

    // 如果传入的是字符串，转换为PSBT对象
    let psbtObj: bitcoin.Psbt;
    if (typeof psbt === 'string') {
      const network = toPsbtNetwork(this.wallet.networkType);
      psbtObj = bitcoin.Psbt.fromHex(psbt, { network });
    } else {
      psbtObj = psbt;
    }

    return await this.wallet.signPsbt(psbtObj, signOptions);
  }

  /**
   * 批量签名PSBTs
   * @param psbts PSBT数组
   * @param options 签名选项
   */
  async signPsbts(psbts: Array<string | bitcoin.Psbt>, options?: PsbtSignOptions): Promise<bitcoin.Psbt[]> {
    const results: bitcoin.Psbt[] = [];

    for (const psbt of psbts) {
      const signedPsbt = await this.signPsbt(psbt, options);
      results.push(signedPsbt);
    }

    return results;
  }

  /**
   * 将Unisat格式的PSBT签名选项转换为内部格式
   */
  private convertPsbtSignOptions(options?: PsbtSignOptions): SignPsbtOptions {
    if (!options) {
      return { autoFinalized: true };
    }

    const converted: SignPsbtOptions = {
      autoFinalized: options.autoFinalized !== false // 默认为true
    };

    if (options.toSignInputs) {
      converted.toSignInputs = options.toSignInputs.map((input) => ({
        index: input.index,
        address: input.address,
        publicKey: input.publicKey,
        sighashTypes: input.sighashTypes,
        useTweakedSigner: input.useTweakedSigner,
        disableTweakSigner: input.disableTweakSigner,
        tapLeafHashToSign: input.tapLeafHashToSign as any // 转换为Buffer类型
      }));
    }

    return converted;
  }
}
