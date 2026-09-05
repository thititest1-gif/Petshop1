import { useEffect, useState } from 'react'
import BottomNavigation from '../../components/home/BottomNavigation.jsx'
import PetCard from '../../components/pets/PetCard.jsx'
import PetsHeader from '../../components/pets/PetsHeader.jsx'
import ImageCropper from '../../components/pets/ImageCropper.jsx'
import { PETS_UPDATED_EVENT, defaultPets, getPets, savePets } from '../../data/pets.js'

const PET_ERROR_SHAKE_STYLES = `
@keyframes petshop-error-shake {
  0% { transform: translateX(0); }
  28.57% { transform: translateX(6px); }
  57.14% { transform: translateX(-6px); }
  78.57% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
.petshop-shake { animation: petshop-error-shake 280ms linear; }
@media (prefers-reduced-motion: reduce) {
  .petshop-shake { animation: none !important; }
}
`

const emptyForm = { image: '', name: '', type: 'แมว', breed: '', age: '', weight: '', gender: 'ตัวผู้', born: '', neutered: 'ยังไม่ได้ทำ', disease: 'ไม่มี', health: 'ไม่มี', note: '' }

export default function Pets() {
  const [pets, setPets] = useState(defaultPets)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [shakeFields, setShakeFields] = useState({})
  const [cropSrc, setCropSrc] = useState('')

  useEffect(() => {
    if (document.getElementById('petshop-error-shake')) return
    const style = document.createElement('style')
    style.id = 'petshop-error-shake'
    style.textContent = PET_ERROR_SHAKE_STYLES
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    const sync = () => setPets(getPets())
    sync()
    window.addEventListener(PETS_UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(PETS_UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const openAdd = () => { setEditingId(null); setForm({ ...emptyForm }); setErrors({}); setShakeFields({}); setIsOpen(true) }
  const openEdit = (pet) => {
    setEditingId(pet.id)
    setErrors({})
    setShakeFields({})
    setForm({ image: pet.image || '', name: pet.name || '', type: pet.type || 'แมว', breed: pet.breed || '', age: String(pet.age || '').replace(' ปี', ''), weight: String(pet.weight || '').replace(' กก.', ''), gender: pet.gender || 'ตัวผู้', born: pet.born || '', neutered: pet.neutered || 'ยังไม่ได้ทำ', disease: pet.disease || 'ไม่มี', health: pet.health || 'ไม่มี', note: pet.note || '' })
    setIsOpen(true)
  }
  const closeForm = () => { setIsOpen(false); setEditingId(null); setForm({ ...emptyForm }); setErrors({}); setShakeFields({}) }
  const savePet = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'กรุณากรอกชื่อสัตว์เลี้ยง'
    if (!form.type) nextErrors.type = 'กรุณาเลือกประเภทสัตว์'
    if (!form.breed.trim()) nextErrors.breed = 'กรุณากรอกสายพันธุ์'
    if (form.age === '') nextErrors.age = 'กรุณากรอกอายุ'
    else if (Number(form.age) < 0) nextErrors.age = 'อายุต้องไม่ติดลบ'
    if (form.weight === '') nextErrors.weight = 'กรุณากรอกน้ำหนัก'
    else if (Number(form.weight) <= 0) nextErrors.weight = 'น้ำหนักต้องมากกว่า 0 กก.'
    if (!form.gender) nextErrors.gender = 'กรุณาเลือกเพศ'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setShakeFields({})
      window.requestAnimationFrame(() => {
        setShakeFields({ ...nextErrors })
        window.setTimeout(() => setShakeFields({}), 320)
      })
      return
    }
    const oldPet = editingId ? getPets().find((pet) => pet.id === editingId) : null
    const nextPet = { id: editingId ?? Date.now(), image: form.image || '', name: form.name.trim(), type: form.type, breed: form.breed || 'ไม่ระบุสายพันธุ์', age: form.age ? `${form.age} ปี` : '-', weight: form.weight ? `${form.weight} กก.` : '-', icon: form.type === 'สุนัข' ? 'fa-dog' : 'fa-cat', gender: form.gender, color: form.gender === 'ตัวเมีย' ? 'pink' : 'green', born: form.born || '-', neutered: form.neutered || 'ยังไม่ได้ทำ', disease: form.disease.trim() || 'ไม่มี', health: form.health.trim() || 'ไม่มี', note: form.note.trim() || '-', favorite: oldPet?.favorite ?? false }
    const current = getPets()
    const next = editingId ? current.map((pet) => pet.id === editingId ? nextPet : pet) : [...current, nextPet]
    savePets(next); setPets(next); closeForm()
  }
  const deletePet = (pet) => {
    if (!window.confirm(`ต้องการลบ ${pet.name} หรือไม่?`)) return
    const next = getPets().filter((item) => item.id !== pet.id); savePets(next); setPets(next)
  }
  const toggleFavorite = (pet) => {
    const current = getPets()
    const isFavoriting = !pet.favorite
    const updated = current.map((item) => item.id === pet.id ? { ...item, favorite: isFavoriting } : item)
    const next = isFavoriting
      ? [updated.find((item) => item.id === pet.id), ...updated.filter((item) => item.id !== pet.id)]
      : updated
    savePets(next); setPets(next)
  }
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const chooseImage = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-gray-50 font-sans text-gray-800 min-[431px]:shadow-[0_0_40px_rgba(17,24,39,0.10)]">
      <PetsHeader />
      <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-3 flex items-center justify-between"><h2 className="m-0 text-base font-bold text-gray-900">สัตว์เลี้ยงทั้งหมด</h2><p className="m-0 text-xs font-medium text-gray-400">{pets.length} ตัว</p></div>
        {pets.length > 0 ? <div className="space-y-4">{pets.map((pet, index) => <PetCard key={pet.id} pet={pet} variant="full" isMain={index === 0} onEdit={openEdit} onDelete={deletePet} onToggleFavorite={toggleFavorite} />)}</div> : <button type="button" onClick={openAdd} className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-orange-200 bg-white text-center active:bg-orange-50"><span className="grid size-14 place-items-center rounded-full bg-orange-50 text-2xl text-orange-500"><i className="fa-solid fa-plus" /></span><strong className="mt-3 text-sm text-orange-500">เพิ่มสัตว์เลี้ยง</strong><span className="mt-1 text-xs text-gray-400">เพิ่มข้อมูลน้องเพื่อรับคำแนะนำที่แม่นยำยิ่งขึ้น</span></button>}
        {pets.length > 0 && <button type="button" onClick={openAdd} className="mt-4 flex min-h-[125px] w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white text-center active:bg-gray-50"><span className="grid size-11 place-items-center rounded-full bg-orange-500 text-xl text-white"><i className="fa-solid fa-plus" /></span><strong className="mt-2 text-sm text-orange-500">เพิ่มสัตว์เลี้ยง</strong><span className="mt-1 text-[10px] text-gray-400">เพิ่มข้อมูลน้องเพื่อรับคำแนะนำที่แม่นยำยิ่งขึ้น</span></button>}
      </main>
      <BottomNavigation />

      {isOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 p-3 min-[431px]:items-center"><form noValidate onSubmit={savePet} className="max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="m-0 mt-1 text-lg font-bold">{editingId ? 'แก้ไขข้อมูลน้อง' : 'เพิ่มสัตว์เลี้ยง'}</h2></div><button type="button" onClick={closeForm} className="grid size-9 place-items-center rounded-full bg-gray-100"><i className="fa-solid fa-xmark" /></button></div>
        <div className="mb-4 flex flex-col items-center"><label className="relative cursor-pointer"><div className="grid size-28 place-items-center overflow-hidden rounded-full border-4 border-orange-100 bg-orange-50 text-4xl text-orange-300">{form.image ? <img src={form.image} alt={form.name} className="h-full w-full object-cover" /> : <i className={`fa-solid ${form.type === 'สุนัข' ? 'fa-dog' : 'fa-cat'}`} />}</div><span className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border-4 border-white bg-orange-500 text-white"><i className="fa-solid fa-camera text-sm" /></span><input type="file" accept="image/*" className="hidden" onChange={chooseImage} /></label><span className="mt-2 text-[11px] text-gray-400">แตะรูปเพื่อเพิ่มหรือเปลี่ยนรูปน้อง</span></div>
        <div className="space-y-3">
          <label className="block"><span className="mb-1.5 block text-xs font-bold">ชื่อสัตว์เลี้ยง</span><input value={form.name} onChange={(e) => { setField('name', e.target.value); if (errors.name) setErrors((current) => ({ ...current, name: '' })) }} aria-invalid={!!errors.name} className={`h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm outline-none focus:bg-white ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'} ${shakeFields.name ? 'petshop-shake' : ''}`} />{errors.name && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.name}</span>}</label>
          <div><span className="mb-1.5 block text-xs font-bold">ประเภทสัตว์</span><div className="grid grid-cols-2 gap-2">{['สุนัข','แมว'].map((type) => <button key={type} type="button" onClick={() => { setField('type', type); setErrors((current) => ({ ...current, type: '' })) }} className={`h-11 rounded-xl border text-sm font-bold ${form.type === type ? 'border-orange-400 bg-orange-50 text-orange-500' : 'border-gray-200 bg-white text-gray-600'} ${shakeFields.type ? 'petshop-shake' : ''}`}>{type === 'สุนัข' ? '🐶' : '🐱'} {type}</button>)}</div>{errors.type && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.type}</span>}</div>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">สายพันธุ์</span><input value={form.breed} onChange={(e) => { setField('breed', e.target.value); if (errors.breed) setErrors((current) => ({ ...current, breed: '' })) }} aria-invalid={!!errors.breed} className={`h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm outline-none focus:bg-white ${errors.breed ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'} ${shakeFields.breed ? 'petshop-shake' : ''}`} />{errors.breed && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.breed}</span>}</label>
          <div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-xs font-bold">อายุ (ปี)</span><input type="number" min="0" step="0.1" value={form.age} onChange={(e) => { setField('age', e.target.value); if (errors.age) setErrors((current) => ({ ...current, age: '' })) }} aria-invalid={!!errors.age} className={`h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm outline-none ${errors.age ? 'border-red-400' : 'border-gray-200'} ${shakeFields.age ? 'petshop-shake' : ''}`} />{errors.age && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.age}</span>}</label><label className="block"><span className="mb-1.5 block text-xs font-bold">น้ำหนัก (กก.)</span><input type="number" min="0.1" step="0.1" value={form.weight} onChange={(e) => { setField('weight', e.target.value); if (errors.weight) setErrors((current) => ({ ...current, weight: '' })) }} aria-invalid={!!errors.weight} className={`h-11 w-full rounded-xl border bg-gray-50 px-3 text-sm outline-none ${errors.weight ? 'border-red-400' : 'border-gray-200'} ${shakeFields.weight ? 'petshop-shake' : ''}`} />{errors.weight && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.weight}</span>}</label></div>
          <div><span className="mb-1.5 block text-xs font-bold">เพศ</span><div className="grid grid-cols-2 gap-2">{['ตัวผู้','ตัวเมีย'].map((gender) => <button key={gender} type="button" onClick={() => { setField('gender', gender); setErrors((current) => ({ ...current, gender: '' })) }} className={`h-11 rounded-xl border text-sm font-bold ${form.gender === gender ? 'border-orange-400 bg-orange-50 text-orange-500' : 'border-gray-200 bg-white text-gray-600'} ${shakeFields.gender ? 'petshop-shake' : ''}`}>{gender === 'ตัวผู้' ? '♂' : '♀'} {gender}</button>)}</div>{errors.gender && <span className="mt-1 block text-[11px] font-medium text-red-500">{errors.gender}</span>}</div>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">วันเกิดโดยประมาณ</span><input value={form.born} onChange={(e) => setField('born', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm" placeholder="เช่น 15 พฤษภาคม 2567" /></label>
          <div><span className="mb-1.5 block text-xs font-bold">การทำหมัน</span><div className="grid grid-cols-2 gap-2">{['ทำแล้ว','ยังไม่ได้ทำ'].map((value) => <button key={value} type="button" onClick={() => setField('neutered', value)} className={`h-11 rounded-xl border text-sm font-bold ${form.neutered === value ? 'border-orange-400 bg-orange-50 text-orange-500' : 'border-gray-200 bg-white text-gray-600'}`}>{value === 'ทำแล้ว' ? '✓ ทำแล้ว' : 'ยังไม่ได้ทำ'}</button>)}</div></div>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">โรคประจำตัว</span><input value={form.disease} onChange={(e) => setField('disease', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm" placeholder="เช่น ไม่มี, โรคไต, เบาหวาน" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">ปัญหาสุขภาพ</span><input value={form.health} onChange={(e) => setField('health', e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm" placeholder="เช่น ไม่มี, แพ้อาหาร" /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold">หมายเหตุ</span><textarea value={form.note} onChange={(e) => setField('note', e.target.value)} rows="3" className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm" placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับน้อง" /></label>
        </div>
        <button type="submit" className="mt-5 h-12 w-full rounded-2xl bg-orange-500 text-sm font-bold text-white">{editingId ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลน้อง'}</button>
      </form></div>}

      {cropSrc && <ImageCropper src={cropSrc} onCancel={() => setCropSrc('')} onCrop={(image) => { setField('image', image); setCropSrc('') }} />}
    </div>
  )
}
