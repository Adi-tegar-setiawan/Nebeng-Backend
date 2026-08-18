export class VerificationMapper {
  static toResponse(verification: any) {
    if (!verification) return null;

    return {
      id: verification.id.toString(),
      userId: verification.userId.toString(),
      approvedByUserId: verification.approvedByUserId
        ? verification.approvedByUserId.toString()
        : null,
      type: verification.type,
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
      files: verification.files
        ? verification.files.map((file: any) => ({
            id: file.id.toString(),
            verificationId: file.verificationId.toString(),
            filePath: file.filePath,
            fileType: file.fileType,
            createdAt: file.createdAt,
          }))
        : [],
      user: verification.user
        ? {
            id: verification.user.id.toString(),
            name: verification.user.name,
            email: verification.user.email,
            phone: verification.user.phone,
            statusVerification: verification.user.statusVerification,
          }
        : undefined,
    };
  }
}
