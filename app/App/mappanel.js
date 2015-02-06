

Ext.define('PGP.mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal",   			
	layout:'border',	
	region:'center',
	tPanel:'',
	width:100,
	height:100,
	buildButtons:function(){
	return[{
			xtype:'button',
			text:'Add to List'
			}
		
		]
	},
	buildItems:function(){	
	},	
	initComponent:function(){				
		var popup, me=this 			
		console.log(me);
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),
					new OpenLayers.Control.LayerSwitcher(),			
							
					
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		        
       var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					//displayInLayerSwitcher: false,				
				}
		);
			
		
		map.addLayer(pgp_basemap_cache);
		
		this.buttons = this.buildButtons();
		
		
		
		Ext.apply(this, {
			map:map,
			
		});		
		
		this.callParent(arguments);   
    }	
	
	
});


