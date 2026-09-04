import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateRelatoDto {
  @IsString()
  @IsNotEmpty()
  comunidade: string;

  @IsString()
  @IsNotEmpty()
  tipoViolacao: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  local: string;

  @IsDateString()
  dataOcorrido: string;

  @IsOptional()
  @IsIn(['novo', 'em_analise', 'encaminhado', 'resolvido'])
  status?: string;
}
