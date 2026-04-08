import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInput, TextArea, Button, Stack, InlineLoading } from '@carbon/react'
import { productSchema, type ProductForm as PF } from '@/lib/validators'
import { useCreateProduct, useUpdateProduct, useGenerateImage } from '@/hooks/use-products'
import { useToast } from '@/contexts/ToastContext'
import type { Product } from '@/types'

interface Props { product?: Product; onSuccess: () => void }

export function ProductForm({ product, onSuccess }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PF>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? { name: product.name, description: product.description ?? '', price: product.price, stock: product.stock, imageUrl: product.imageUrl ?? '' } : undefined,
  })
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const genImage = useGenerateImage()
  const { addToast } = useToast()
  const isPending = create.isPending || update.isPending
  const imageUrl = watch('imageUrl')

  const onSubmit = async (data: PF) => {
    try {
      if (product) await update.mutateAsync({ id: product.id, ...data })
      else await create.mutateAsync(data)
      addToast('success', product ? '상품 수정됨' : '상품 추가됨')
      onSuccess()
    } catch { addToast('error', '저장 실패') }
  }

  const handleGenerate = async () => {
    const name = watch('name')
    if (!name) return
    try {
      const res = await genImage.mutateAsync({ productName: name, description: watch('description') ?? '' })
      setValue('imageUrl', res.imageUrl)
    } catch { addToast('error', '이미지 생성 실패') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="product-form">
      <Stack gap={5}>
        <TextInput id="name" labelText="상품명" {...register('name')} invalid={!!errors.name} invalidText={errors.name?.message} />
        <TextArea id="desc" labelText="설명" {...register('description')} rows={3} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <TextInput id="price" labelText="가격" type="number" step="0.01" {...register('price')} invalid={!!errors.price} invalidText={errors.price?.message} />
          <TextInput id="stock" labelText="재고" type="number" step="1" {...register('stock')} invalid={!!errors.stock} invalidText={errors.stock?.message} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextInput id="imageUrl" labelText="이미지 URL" {...register('imageUrl')} style={{ flex: 1 }} />
          <Button kind="tertiary" size="md" onClick={handleGenerate} disabled={genImage.isPending} data-testid="generate-image-button" style={{ alignSelf: 'flex-end' }}>
            {genImage.isPending ? <InlineLoading description="생성 중..." /> : 'AI 이미지'}
          </Button>
        </div>
        {imageUrl && <img src={imageUrl} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />}
        <Button type="submit" disabled={isPending} data-testid="product-form-submit">
          {isPending ? <InlineLoading description="저장 중..." /> : product ? '수정' : '추가'}
        </Button>
      </Stack>
    </form>
  )
}
