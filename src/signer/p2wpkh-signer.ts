import { ECPair } from '../bitcoin-core';
import { NetworkType, toPsbtNetwork } from '../network';
import { AddressType } from '../types';
import { LocalWallet } from '../wallet/local-wallet';
import { BaseSigner } from './base-signer';
import { FromMnemonicOptions, FromPrivateKeyOptions, ISignerFactory, WalletInitOptions } from './types';

/**
 * P2WPKH签名器类
 * 专门用于bc1q地址（SegWit v0）的签名
 */
export class P2WPKHSigner extends BaseSigner {
  constructor(wallet: LocalWallet) {
    super(wallet);

    // 确保钱包类型为P2WPKH
    if (wallet.addressType !== AddressType.P2WPKH) {
      throw new Error('P2WPKHSigner只能与P2WPKH地址类型的钱包配合使用');
    }
  }

  /**
   * P2WPKH签名器工厂
   */
  static factory: ISignerFactory<P2WPKHSigner> = {
    /**
     * 从随机生成创建P2WPKH签名器
     */
    fromRandom(options?: WalletInitOptions): P2WPKHSigner {
      const networkType = options?.networkType ?? NetworkType.MAINNET;
      const wallet = LocalWallet.fromRandom(AddressType.P2WPKH, networkType);
      return new P2WPKHSigner(wallet);
    },

    /**
     * 从私钥创建P2WPKH签名器
     */
    fromPrivateKey(options: FromPrivateKeyOptions): P2WPKHSigner {
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

      const wallet = new LocalWallet(keyPair.toWIF(), AddressType.P2WPKH, networkType);
      return new P2WPKHSigner(wallet);
    },

    /**
     * 从助记词创建P2WPKH签名器
     */
    fromMnemonic(options: FromMnemonicOptions): P2WPKHSigner {
      const { mnemonic, networkType = NetworkType.MAINNET, hdPath, passphrase } = options;

      const wallet = LocalWallet.fromMnemonic(AddressType.P2WPKH, networkType, mnemonic, passphrase, hdPath);
      return new P2WPKHSigner(wallet);
    }
  };

  /**
   * 静态方法：从随机生成创建
   */
  static fromRandom(options?: WalletInitOptions): P2WPKHSigner {
    return P2WPKHSigner.factory.fromRandom(options);
  }

  /**
   * 静态方法：从私钥创建
   */
  static fromPrivateKey(options: FromPrivateKeyOptions): P2WPKHSigner {
    return P2WPKHSigner.factory.fromPrivateKey(options);
  }

  /**
   * 静态方法：从助记词创建
   */
  static fromMnemonic(options: FromMnemonicOptions): P2WPKHSigner {
    return P2WPKHSigner.factory.fromMnemonic(options);
  }
}
