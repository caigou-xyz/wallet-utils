import { ECPair } from '../bitcoin-core';
import { NetworkType, toPsbtNetwork } from '../network';
import { AddressType } from '../types';
import { LocalWallet } from '../wallet/local-wallet';
import { BaseSigner } from './base-signer';
import { FromMnemonicOptions, FromPrivateKeyOptions, ISignerFactory, WalletInitOptions } from './types';

/**
 * P2TR签名器类
 * 专门用于bc1p地址（Taproot）的签名
 */
export class P2TRSigner extends BaseSigner {
  constructor(wallet: LocalWallet) {
    super(wallet);

    // 确保钱包类型为P2TR
    if (wallet.addressType !== AddressType.P2TR) {
      throw new Error('P2TRSigner只能与P2TR地址类型的钱包配合使用');
    }
  }

  /**
   * P2TR签名器工厂
   */
  static factory: ISignerFactory<P2TRSigner> = {
    /**
     * 从随机生成创建P2TR签名器
     */
    fromRandom(options?: WalletInitOptions): P2TRSigner {
      const networkType = options?.networkType ?? NetworkType.MAINNET;
      const wallet = LocalWallet.fromRandom(AddressType.P2TR, networkType);
      return new P2TRSigner(wallet);
    },

    /**
     * 从私钥创建P2TR签名器
     */
    fromPrivateKey(options: FromPrivateKeyOptions): P2TRSigner {
      const { privateKey, networkType = NetworkType.MAINNET } = options;

      // 创建私钥对象
      const network = toPsbtNetwork(networkType);
      let keyPair;

      if (privateKey.length === 64) {
        // 十六进制私钥
        const privateKeyBuffer = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          privateKeyBuffer[i] = parseInt(privateKey.slice(i * 2, i * 2 + 2), 16);
        }
        keyPair = ECPair.fromPrivateKey(privateKeyBuffer as any, { network });
      } else {
        // WIF格式私钥
        keyPair = ECPair.fromWIF(privateKey, network);
      }

      const wallet = new LocalWallet(keyPair.toWIF(), AddressType.P2TR, networkType);
      return new P2TRSigner(wallet);
    },

    /**
     * 从助记词创建P2TR签名器
     */
    fromMnemonic(options: FromMnemonicOptions): P2TRSigner {
      const { mnemonic, networkType = NetworkType.MAINNET, hdPath, passphrase } = options;

      const wallet = LocalWallet.fromMnemonic(AddressType.P2TR, networkType, mnemonic, passphrase, hdPath);
      return new P2TRSigner(wallet);
    }
  };

  /**
   * 静态方法：从随机生成创建
   */
  static fromRandom(options?: WalletInitOptions): P2TRSigner {
    return P2TRSigner.factory.fromRandom(options);
  }

  /**
   * 静态方法：从私钥创建
   */
  static fromPrivateKey(options: FromPrivateKeyOptions): P2TRSigner {
    return P2TRSigner.factory.fromPrivateKey(options);
  }

  /**
   * 静态方法：从助记词创建
   */
  static fromMnemonic(options: FromMnemonicOptions): P2TRSigner {
    return P2TRSigner.factory.fromMnemonic(options);
  }
}
