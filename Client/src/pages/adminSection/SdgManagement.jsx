import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ApiService from "@/services/api"
import { AdminSidebar } from "@/components/AdminSidebar"
import { MouseFollower } from "@/components/mouse-follower"
import { ScrollProgress } from "@/components/scroll-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

export default function SdgManagement() {
  const [odds, setOdds] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedODD, setSelectedODD] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [weightInput, setWeightInput] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOdds()
  }, [])

  const fetchOdds = async () => {
    setLoading(true)
    try {
      const res = await ApiService.getAllODDs()
      setOdds(res.odds || [])
    } catch (e) {
      setOdds([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOdds = (odds || []).filter(
    (odd) =>
      odd.name.en.toLowerCase().includes(search.toLowerCase()) ||
      String(odd.oddId).includes(search)
  )

  // Dummy handlers for seed/reset (à remplacer par vraies actions si besoin)
  const handleSeedODDs = async () => {
    await ApiService.seedDefaultODDs()
    fetchOdds()
  }
  const handleResetODDs = async () => {
    await ApiService.resetODDs()
    fetchOdds()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex">
      <MouseFollower />
      <ScrollProgress />
      <AdminSidebar activePage="sdg-management" />

      <div className="flex-1 relative z-10 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600 mb-2">
              SDG Management
            </h1>
            <p className="text-zinc-400">Configure and manage the SDGs.</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleSeedODDs} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Generate default SDGs
            </Button>
            <Button onClick={handleResetODDs} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Reinitialize SDGs
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6 flex items-center">
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Loading */}
        {loading && <div className="text-center text-zinc-400 py-12">Loading SDGs...</div>}


        {/* Formulaire d'édition d'ODD */}
        {showEditForm && selectedODD && (
          <Card className="mb-6 bg-zinc-900 border border-yellow-900/60 shadow-lg">
            <CardHeader>
              <CardTitle>Update SDG {selectedODD.oddId}</CardTitle>
              <CardDescription>Change informations of this SDG</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ici, vous pouvez ajouter le formulaire d'édition d'ODD */}
              <div className="flex space-x-2">
                <Button onClick={() => setShowEditForm(false)} variant="outline">
                  Cancel
                </Button>
                <Button className="bg-yellow-600 hover:bg-yellow-700">Save</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOdds.map((odd) => (
            <Card
              key={odd._id}
              className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm hover:bg-zinc-800/70 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">SDG {odd.oddId}</CardTitle>
                    <CardDescription className="line-clamp-2">{odd.name.en}</CardDescription>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: odd.color }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Weight:</span>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      {odd.weight}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Climate Focus :</span>
                    <Badge
                      variant="outline"
                      className={
                        odd.isClimateFocus
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : "bg-zinc-500/20 text-zinc-400 border-zinc-500/50"
                      }
                    >
                      {odd.isClimateFocus ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedODD(odd)
                        setWeightInput(odd.weight)
                        setShowUpdateModal(true)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedODD(odd)
                        setShowViewModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Update Weight */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent
          className="bg-zinc-900/95 border border-zinc-700 max-w-lg"
          style={{ boxShadow: `0 0 40px 0 ${(selectedODD?.color || '#a78bfa')}cc` }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: selectedODD?.color || '#a78bfa' }}
            >
              Update SDG {selectedODD?.oddId}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="text-zinc-400">You can only change the weight of this SDG.</div>
            <div className="flex items-center gap-4">
              <label className="font-bold text-white">Weight:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={weightInput}
                onChange={e => setWeightInput(Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={async () => {
                // Appelle l'API pour update le poids
                await ApiService.updateODD(selectedODD._id, { weight: weightInput })
                setShowUpdateModal(false)
                fetchOdds()
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal View SDG */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent
          className="bg-zinc-900/95 border border-zinc-700 max-w-lg"
          style={{ boxShadow: `0 0 40px 0 ${(selectedODD?.color || '#a78bfa')}cc` }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: selectedODD?.color || '#a78bfa' }}
            >
              SDG {selectedODD?.oddId} Details
            </DialogTitle>
          </DialogHeader>
          {selectedODD && (
            <div className="mt-4 text-white space-y-3">
              {/* Each row is a flex: label left, value right, both left-aligned, value starts after a fixed width */}
              <div className="flex items-center">
                <div className="text-zinc-400 font-semibold min-w-[130px]">Number</div>
                <div>{selectedODD.oddId}</div>
              </div>
              <div className="flex items-center">
                <div className="text-zinc-400 font-semibold min-w-[130px]">Name</div>
                <div>{selectedODD.name?.en}</div>
              </div>
              <div className="flex items-center">
                <div className="text-zinc-400 font-semibold min-w-[130px]">Weight</div>
                <div>{selectedODD.weight}</div>
              </div>
              <div className="flex items-center">
                <div className="text-zinc-400 font-semibold min-w-[130px]">Climate Focus</div>
                <div>{selectedODD.isClimateFocus ? 'Yes' : 'No'}</div>
              </div>
              <div className="flex items-center">
                <div className="text-zinc-400 font-semibold min-w-[130px]">Color</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: selectedODD.color }}></span>
                  <span>{selectedODD.color}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="bg-zinc-800 text-white border border-zinc-500 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white transition">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}