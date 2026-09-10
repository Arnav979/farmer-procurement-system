import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import { SelectInput, TextInput } from '../components/ui/Field.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import CentreCard from '../components/farmer/CentreCard.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import { centreApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { CROPS } from '../utils/constants.js'

const SORTS = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'wait', label: 'Shortest waiting time' },
  { value: 'capacity', label: 'Most capacity left' },
]

export default function Centres() {
  useDocumentTitle('Procurement centres')
  const [crop, setCrop] = useState('')
  const [sort, setSort] = useState('distance')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const { data: centres, loading, error, refetch } = useApi(
    () => centreApi.list({ crop, sort, search }),
    [crop, sort, search],
    { pollMs: 60000 },
  )

  const clearFilters = () => {
    setCrop('')
    setSort('distance')
    setSearchInput('')
    setSearch('')
  }

  return (
    <>
      <PageHeader
        title="Procurement centres"
        hindiTitle="क्रय केंद्र"
        description="Waiting times update through the day. Book at a centre that still has capacity left."
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Refresh
          </Button>
        }
      />

      <form
        className="mb-5 grid gap-4 border border-line bg-white px-4 py-4 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault()
          setSearch(searchInput.trim())
        }}
      >
        <TextInput
          label="Search by village or PIN code"
          name="search"
          placeholder="Nilokheri, 132117"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <SelectInput
          label="Buying which crop"
          name="crop"
          placeholder="Any crop"
          options={CROPS.map((item) => ({ value: item.code, label: item.name }))}
          value={crop}
          onChange={(event) => setCrop(event.target.value)}
        />
        <SelectInput
          label="Sort centres by"
          name="sort"
          placeholder="Nearest first"
          options={SORTS}
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <Button type="submit" size="sm" icon={<Icon name="search" className="h-4 w-4" />}>
            Search
          </Button>
          {crop || search || sort !== 'distance' ? (
            <Button type="button" variant="neutral" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </form>

      {loading && !centres ? <SkeletonRows rows={3} /> : null}
      {error && !centres ? <ErrorState error={error} onRetry={refetch} title="Centres did not load" /> : null}

      {centres ? (
        centres.length === 0 ? (
          <EmptyState
            icon="map-pin"
            title="No centre matches your search"
            description="Try a different crop, or clear the filters to see every centre in your district."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-3 text-[15px] text-muted tnum">
              {centres.length} {centres.length === 1 ? 'centre' : 'centres'} found
            </p>
            <div className="space-y-4">
              {centres.map((centre) => (
                <CentreCard key={centre.id} centre={centre} />
              ))}
            </div>
          </>
        )
      ) : null}
    </>
  )
}
