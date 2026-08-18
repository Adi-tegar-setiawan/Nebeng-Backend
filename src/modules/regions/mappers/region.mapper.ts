export class RegionMapper {
  static toRegionResponse(region: any) {
    if (!region) return null;

    return {
      id: region.id.toString(),
      name: region.name,
      code: region.code,
      isActive: region.isActive,
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
    };
  }

  static toCityResponse(city: any) {
    if (!city) return null;

    return {
      id: city.id.toString(),
      name: city.name,
      province: city.province,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
    };
  }
}
