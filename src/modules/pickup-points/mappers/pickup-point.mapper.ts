export class PickupPointMapper {
  static toResponse(pos: any) {
    if (!pos) return null;

    return {
      id: pos.id.toString(),
      regionId: pos.regionId.toString(),
      cityId: pos.cityId.toString(),
      operatorId: pos.operatorId ? pos.operatorId.toString() : null,
      name: pos.name,
      address: pos.address,
      latitude: Number(pos.latitude),
      longitude: Number(pos.longitude),
      qrCodePos: pos.qrCodePos,
      isActive: pos.isActive,
      createdAt: pos.createdAt,
      updatedAt: pos.updatedAt,
      region: pos.region
        ? {
            id: pos.region.id.toString(),
            name: pos.region.name,
            code: pos.region.code,
          }
        : undefined,
      city: pos.city
        ? {
            id: pos.city.id.toString(),
            name: pos.city.name,
            province: pos.city.province,
          }
        : undefined,
      operator: pos.operator
        ? {
            id: pos.operator.id.toString(),
            name: pos.operator.name,
            email: pos.operator.email,
            phone: pos.operator.phone,
          }
        : undefined,
    };
  }
}
