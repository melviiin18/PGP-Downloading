
Ext.Loader.setConfig({
disableCaching: false,
enabled: true,
paths: {   
    PGP:'/App',
	GeoExt: "/lib/GeoExt",		
	Ext: '/lib/extjs/src',
	
	} 
});

Ext.application({
    name: 'OL3EXT4',	
	requires:[
		'PGP.mappanel','PGP.Transactions', 'PGP.AvailableLayers'
		],
    launch: function () {
	
		
		var MapPanel= Ext.create('PGP.mappanel');	 				
		var Trans= Ext.create('PGP.Transactions');	 		
		var AvailableLayers= Ext.create('PGP.AvailableLayers');	 		
		
		
        Ext.create('Ext.container.Viewport', {	
            layout: 'border',						
            items:[			
				MapPanel,
				Trans,				
				AvailableLayers				
            ]
        });	
    }
});


