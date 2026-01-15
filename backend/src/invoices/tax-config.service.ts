import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxConfig } from './entities/tax-config.entity';
import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
import { UpdateTaxConfigDto } from './dto/update-tax-config.dto';

@Injectable()
export class TaxConfigService {
  constructor(
    @InjectRepository(TaxConfig)
    private taxConfigRepository: Repository<TaxConfig>,
  ) {}

  async create(createTaxConfigDto: CreateTaxConfigDto): Promise<TaxConfig> {
    // Si se marca como default, desmarcar otros
    if (createTaxConfigDto.isDefault) {
      await this.taxConfigRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    const taxConfig = this.taxConfigRepository.create(createTaxConfigDto);
    return await this.taxConfigRepository.save(taxConfig);
  }

  async findAll(): Promise<TaxConfig[]> {
    return await this.taxConfigRepository.find({
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findActive(): Promise<TaxConfig[]> {
    return await this.taxConfigRepository.find({
      where: { isActive: true },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TaxConfig> {
    const taxConfig = await this.taxConfigRepository.findOne({
      where: { id },
    });

    if (!taxConfig) {
      throw new NotFoundException('Configuración de impuesto no encontrada');
    }

    return taxConfig;
  }

  async findDefault(): Promise<TaxConfig | null> {
    return await this.taxConfigRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  async update(id: string, updateTaxConfigDto: UpdateTaxConfigDto): Promise<TaxConfig> {
    const taxConfig = await this.findOne(id);

    // Si se marca como default, desmarcar otros
    if (updateTaxConfigDto.isDefault) {
      await this.taxConfigRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(taxConfig, updateTaxConfigDto);
    return await this.taxConfigRepository.save(taxConfig);
  }

  async remove(id: string): Promise<void> {
    const taxConfig = await this.findOne(id);

    if (taxConfig.isDefault) {
      throw new BadRequestException('No se puede eliminar el impuesto por defecto');
    }

    await this.taxConfigRepository.remove(taxConfig);
  }

  async setDefault(id: string): Promise<TaxConfig> {
    const taxConfig = await this.findOne(id);

    // Desmarcar otros como default
    await this.taxConfigRepository.update(
      { isDefault: true },
      { isDefault: false }
    );

    taxConfig.isDefault = true;
    return await this.taxConfigRepository.save(taxConfig);
  }

  /**
   * Calcula el impuesto y el total basado en la configuración
   */
  calculateTax(amount: number, taxConfig: TaxConfig): { tax: number; total: number } {
    const rate = taxConfig.rate / 100;

    if (taxConfig.applicationType === 'included') {
      // Impuesto incluido: el monto ya incluye el impuesto
      // tax = amount - (amount / (1 + rate))
      const baseAmount = amount / (1 + rate);
      const tax = amount - baseAmount;
      return {
        tax: Math.round(tax * 100) / 100,
        total: amount,
      };
    } else {
      // Impuesto adicional: se suma al monto
      const tax = amount * rate;
      return {
        tax: Math.round(tax * 100) / 100,
        total: Math.round((amount + tax) * 100) / 100,
      };
    }
  }
}
