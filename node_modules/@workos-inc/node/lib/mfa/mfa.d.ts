import { WorkOS } from '../workos';
import { ChallengeFactorOptions } from './interfaces/challenge-factor-options';
import { Challenge } from './interfaces/challenge.interface';
import { EnrollFactorOptions } from './interfaces/enroll-factor-options';
import { Factor } from './interfaces/factor.interface';
import { VerifyFactorOptions } from './interfaces/verify-factor-options';
import { VerifyResponse } from './interfaces/verify-challenge-response';
import { VerifyChallengeOptions } from './interfaces/verify-challenge-options';
export declare class Mfa {
    private readonly workos;
    constructor(workos: WorkOS);
    deleteFactor(id: string): Promise<void>;
    getFactor(id: string): Promise<any>;
    enrollFactor(options: EnrollFactorOptions): Promise<Factor>;
    challengeFactor(options: ChallengeFactorOptions): Promise<Challenge>;
    /**
     * @deprecated Please use `verifyChallenge` instead.
     */
    verifyFactor(options: VerifyFactorOptions): Promise<VerifyResponse>;
    verifyChallenge(options: VerifyChallengeOptions): Promise<VerifyResponse>;
}
