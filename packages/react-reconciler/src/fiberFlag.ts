export const enum FiberFlag {
	NoFlags = 0,
	Placement = 1,
	Update = 1 << 1,
	ChildDeletion = 1 << 2,

	//	commitRoot时是否执行mutation
	MutationMask = Placement | Update | ChildDeletion
}
