import QRCode from 'qrcode';
import logger from './logger.js';

/**
 * Generate QR code for Bitcoin payment
 * @param {string} walletAddress - Bitcoin wallet address
 * @returns {Promise<Buffer>} QR code as image buffer
 */
export async function generateBitcoinQR(walletAddress) {
    try {
        // Create Bitcoin URI format
        const bitcoinURI = `bitcoin:${walletAddress}`;

        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(bitcoinURI, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 300,
            margin: 2,
        });

        logger.info('Bitcoin QR code generated successfully');
        return qrBuffer;
    } catch (error) {
        logger.error('Error generating Bitcoin QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * Generate QR code as data URL (for embedding in embeds)
 * @param {string} walletAddress - Bitcoin wallet address
 * @returns {Promise<string>} QR code as data URL
 */
export async function generateBitcoinQRDataURL(walletAddress) {
    try {
        const bitcoinURI = `bitcoin:${walletAddress}`;
        const dataURL = await QRCode.toDataURL(bitcoinURI, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2,
        });

        return dataURL;
    } catch (error) {
        logger.error('Error generating Bitcoin QR data URL:', error);
        throw new Error('Failed to generate QR code');
    }
}
